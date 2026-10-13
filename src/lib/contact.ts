"use client";

import { z } from "zod";

/*
 * Contact form plumbing: validating the fields (zod), opening the popup,
 * remembering what the visitor typed (local storage only, no database) and
 * sending it through Web3Forms, which forwards it to the inbox the access key
 * was created with.
 */

export const NAME_MAX = 20;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 500;
const PHONE_INTL = 12; // digits after a leading "+"
const PHONE_LOCAL = 10; // digits without one

/** One schema for every field; its messages are what the popup shows. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(NAME_MAX, `Your name can be ${NAME_MAX} characters at most.`)
    .regex(/^\p{L}+(?:[ '-]\p{L}+)*$/u, "Please use letters only."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address."))
    .refine((value) => value.endsWith("@gmail.com"), "Please use a Gmail address (ending in @gmail.com)."),
  phone: z
    .string()
    .trim()
    .regex(
      new RegExp(`^(?:\\+\\d{${PHONE_INTL}}|\\d{${PHONE_LOCAL}})$`),
      `Digits only: ${PHONE_LOCAL} digits, or ${PHONE_INTL} after a +.`,
    ),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `A few more words, please (at least ${MESSAGE_MIN} characters).`)
    .max(MESSAGE_MAX, `Please keep it under ${MESSAGE_MAX} characters.`),
});

export type ContactDetails = z.input<typeof contactSchema>;
export type ContactRecord = ContactDetails & { sentAt?: string };
export type ContactErrors = Partial<Record<keyof ContactDetails, string>>;

/** Validates the whole form: the cleaned values, or the first message per field. */
export function validateContact(values: ContactDetails) {
  const result = contactSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} as ContactErrors };
  const errors: ContactErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ContactDetails;
    errors[field] ??= issue.message;
  }
  return { data: null, errors };
}

/** Validates a single field (on blur, or while correcting it). */
export function validateField(field: keyof ContactDetails, value: string) {
  const result = contactSchema.shape[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/** Keeps phone input to digits, with an optional leading "+", and caps the length. */
export function cleanPhone(raw: string) {
  const international = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "").slice(0, international ? PHONE_INTL : PHONE_LOCAL);
  return (international ? "+" : "") + digits;
}

const STORAGE_KEY = "spark-contact";
export const OPEN_CONTACT_EVENT = "spark:contact-open";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
// Public by design: Web3Forms keys are meant for client-side forms.
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

/** Opens the contact popup from anywhere (elements with `data-contact` open it too). */
export function openContact() {
  window.dispatchEvent(new Event(OPEN_CONTACT_EVENT));
}

export function loadContact(): ContactRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ContactRecord) : null;
  } catch {
    return null;
  }
}

export function saveContact(record: ContactRecord) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage can be unavailable (private mode); the form still works, it just won't remember.
  }
}

export class ContactError extends Error {
  constructor(public reason: "not-configured" | "failed") {
    super(reason);
  }
}

export async function sendContact(details: ContactDetails, botcheck: boolean) {
  if (!ACCESS_KEY) {
    // Until the Web3Forms key is added, development simulates a successful send.
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not set; simulating a send.", details);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return;
    }
    throw new ContactError("not-configured");
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `New project enquiry from ${details.name}`,
      from_name: "SPARK website",
      name: details.name,
      email: details.email,
      phone: details.phone,
      message: details.message,
      botcheck,
    }),
  });
  const data = (await response.json().catch(() => null)) as { success?: boolean } | null;
  if (!response.ok || !data?.success) throw new ContactError("failed");
}
