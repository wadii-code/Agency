import { categories, categoryOrder, type CategoryId } from "./taxonomy";
import { INSTAGRAM_URL, SITE_URL } from "./site";

/*
 * The email SPARK receives for each enquiry (sent by /api/contact), styled
 * like the site: black canvas, deep-violet glass card, the hero's bold sans
 * mixed with an italic serif, mono labels and the violet → cyan gradient.
 * Email clients need table layout and inline styles, have no CSS variables
 * and (in Gmail) no web fonts, so the tokens are repeated here as hex values
 * and every font has a system fallback. A plain-text version goes with it.
 */

export type Enquiry = { name: string; email: string; phone: string; message: string };

const C = {
  canvas: "#000000",
  surface: "#120e22",
  inset: "#1a1530",
  text: "#ffffff",
  body: "#e9e7f1",
  muted: "#8e8a9f",
  hairline: "#2a263d",
  violet: "#9d95ff",
  cyan: "#00bae2",
};
const CATEGORY_HEX: Record<CategoryId, string> = {
  web: "#00bae2",
  uiux: "#ff8709",
  commerce: "#fec5fb",
  motion: "#9d95ff",
  infra: "#0ae448",
};
const GRADIENT = `background-color:${C.violet};background-image:linear-gradient(120deg,${C.violet},${C.cyan});`;

const SANS = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
const DISPLAY = "'Inter Tight','Inter','Helvetica Neue',Helvetica,Arial,sans-serif";
const SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif";
const MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
const LABEL = `font-family:${MONO};font-size:11px;line-height:20px;letter-spacing:0.16em;text-transform:uppercase;color:${C.muted};`;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function detailRow(label: string, value: string, first: boolean) {
  const rule = first ? "" : `border-top:1px solid ${C.hairline};`;
  return `<tr>
    <td width="96" valign="top" style="padding:14px 0;${rule}${LABEL}">${label}</td>
    <td valign="top" style="padding:14px 0;${rule}font-family:${SANS};font-size:16px;line-height:20px;color:${C.text};word-break:break-word;">${value}</td>
  </tr>`;
}

function pill(href: string, label: string, primary: boolean) {
  const look = primary
    ? `${GRADIENT}color:#000000;border:1.5px solid ${C.violet};`
    : `color:${C.text};border:1.5px solid rgba(255,255,255,0.4);`;
  return `<td class="btn" style="padding:0 12px 12px 0;">
    <a href="${href}" style="display:inline-block;padding:14px 26px;border-radius:100px;font-family:${SANS};font-size:15px;font-weight:600;line-height:20px;text-decoration:none;white-space:nowrap;${look}">${label}&nbsp;&nbsp;&rarr;</a>
  </td>`;
}

export function renderEnquiryEmail({ name, email, phone, message }: Enquiry) {
  const firstName = name.trim().split(/\s+/)[0];
  const received = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Casablanca",
  }).format(new Date());
  const domain = SITE_URL.replace(/^https?:\/\//, "");
  // Local numbers (06…, 07…) are Moroccan: WhatsApp links need the country code.
  const whatsapp = phone.startsWith("+") ? phone.slice(1) : phone.startsWith("0") ? `212${phone.slice(1)}` : phone;
  const reply = `mailto:${email}?subject=${encodeURIComponent("Re: your project with SPARK")}`;

  const safe = {
    name: escapeHtml(name),
    first: escapeHtml(firstName),
    email: escapeHtml(email),
    phone: escapeHtml(phone),
    message: escapeHtml(message.trim()).replace(/\r?\n/g, "<br>"),
  };
  const preheader = escapeHtml(`${name}: ${message.replace(/\s+/g, " ").trim().slice(0, 110)}`);
  const dots = categoryOrder
    .map((id) => `<span style="color:${CATEGORY_HEX[id]};">&#9679;</span>&nbsp;${categories[id].short}`)
    .join("&nbsp;&nbsp;&nbsp; ");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>New project enquiry from ${safe.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Inter+Tight:wght@800&family=Instrument+Serif:ital@1&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
  @media (max-width: 620px) {
    .px { padding: 28px 22px !important; }
    .h1 { font-size: 34px !important; }
    .btn { display: block !important; padding-right: 0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${C.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.canvas};">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.canvas}" style="background-color:${C.canvas};">
<tr><td align="center" style="padding:36px 12px 44px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

  <!-- Brand bar -->
  <tr><td style="padding:0 6px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" width="44"><img src="${SITE_URL}/apple-icon" width="36" height="36" alt="SPARK" style="display:block;border:1px solid ${C.hairline};border-radius:10px;"></td>
      <td valign="middle" style="font-family:${DISPLAY};font-size:18px;font-weight:800;letter-spacing:0.08em;color:${C.text};">SPARK</td>
      <td valign="middle" align="right" style="${LABEL}">Contact form</td>
    </tr></table>
  </td></tr>

  <!-- Card -->
  <tr><td class="px" bgcolor="${C.surface}" style="padding:44px 40px 32px;background-color:${C.surface};background-image:radial-gradient(120% 90% at 100% 0%,rgba(157,149,255,0.16),rgba(18,14,34,0) 60%);border:1px solid ${C.hairline};border-radius:24px;">

    <p style="margin:0;${LABEL}">{&nbsp; New project enquiry &nbsp;}</p>
    <h1 class="h1" style="margin:18px 0 0;font-family:${DISPLAY};font-size:44px;line-height:1.02;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;color:${C.text};word-break:break-word;">
      New project<br><span style="font-family:${SERIF};font-size:1.08em;font-style:italic;font-weight:400;letter-spacing:0;text-transform:none;">from</span> ${safe.name}
    </h1>
    <div style="width:56px;height:3px;margin-top:24px;border-radius:3px;${GRADIENT}font-size:0;line-height:0;">&nbsp;</div>
    <p style="margin:22px 0 0;font-family:${SANS};font-size:15px;line-height:24px;color:${C.muted};">
      Sent through the contact form on ${escapeHtml(domain)} &middot; ${received} (Casablanca)
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      ${detailRow("Name", safe.name, true)}
      ${detailRow("Email", `<a href="mailto:${safe.email}" style="color:${C.text};text-decoration:none;">${safe.email}</a>`, false)}
      ${detailRow("Phone", `<a href="tel:${safe.phone}" style="color:${C.text};text-decoration:none;">${safe.phone}</a>`, false)}
    </table>

    <p style="margin:26px 0 10px;${LABEL}">The project</p>
    <div style="padding:20px 22px;background-color:${C.inset};border:1px solid ${C.hairline};border-radius:16px;font-family:${SANS};font-size:16px;line-height:26px;color:${C.body};word-break:break-word;">${safe.message}</div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;"><tr>
      ${pill(reply, `Reply to ${safe.first}`, true)}
      ${pill(`https://wa.me/${escapeHtml(whatsapp)}`, "WhatsApp", false)}
    </tr></table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 6px 0;">
    <p style="margin:0;font-family:${SANS};font-size:12px;line-height:22px;color:${C.muted};">${dots}</p>
    <div style="height:1px;margin:22px 0;background-color:${C.hairline};background-image:linear-gradient(90deg,rgba(157,149,255,0),rgba(157,149,255,0.5),rgba(0,186,226,0));font-size:0;line-height:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="top" style="font-family:${DISPLAY};font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${C.text};">SPARK Digital</td>
      <td valign="top" align="right" style="font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};">
        <a href="${SITE_URL}" style="color:${C.muted};text-decoration:none;">${escapeHtml(domain)}</a>
        &nbsp;&middot;&nbsp;
        <a href="${INSTAGRAM_URL}" style="color:${C.muted};text-decoration:none;">Instagram</a>
      </td>
    </tr></table>
    <p style="margin:14px 0 0;font-family:${SANS};font-size:12px;line-height:18px;color:${C.muted};">Hit reply to answer ${safe.first} directly.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `New project enquiry from ${name}`,
    `Received ${received} (Casablanca)`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    "",
    message.trim(),
    "",
    `Reply to this email to answer ${firstName} directly.`,
  ].join("\n");

  return { html, text };
}
