import { contactSchema } from "@/lib/contact";
import { renderEnquiryEmail } from "@/lib/contact-email";
import { CONTACT_EMAIL } from "@/lib/site";

/*
 * Contact form endpoint. The popup posts here and this route sends the email
 * through Resend, so the API key (RESEND_API_KEY) only ever lives on the
 * server and never reaches the browser.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
// Resend's shared test sender only delivers to the Resend account's own address.
// Once hallospark.com is verified in Resend, set RESEND_FROM to e.g. "SPARK <hello@hallospark.com>".
const DEFAULT_FROM = "SPARK website <onboarding@resend.dev>";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  // Spam trap: people never see the "botcheck" box, bots tick it. Pretend it worked.
  if (body && typeof body === "object" && "botcheck" in body && body.botcheck) {
    return Response.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
  const { name, email } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Until the key is added, development simulates a successful send.
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] RESEND_API_KEY is not set; simulating a send.", parsed.data);
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [CONTACT_EMAIL],
      // "Reply" in Gmail answers the visitor directly.
      reply_to: email,
      subject: `New project enquiry from ${name}`,
      ...renderEnquiryEmail(parsed.data),
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend refused the email:", response.status, await response.text());
    return Response.json({ ok: false, error: "failed" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
