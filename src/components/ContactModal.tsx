"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CircleAlert, LoaderCircle, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { CONTACT_EMAIL, CONTACT_EMAIL_URL, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";
import {
  cleanPhone,
  ContactError,
  loadContact,
  MESSAGE_MAX,
  NAME_MAX,
  OPEN_CONTACT_EVENT,
  saveContact,
  sendContact,
  validateContact,
  validateField,
  type ContactDetails,
  type ContactErrors,
} from "@/lib/contact";
import { PillButton } from "./ui/Pill";

type View = "form" | "sending" | "sent";
type Field = keyof ContactDetails;

const EMPTY: ContactDetails = { name: "", email: "", phone: "", message: "" };
const FIELDS: Field[] = ["name", "email", "phone", "message"];
const SPARKS = 8;

/** Brings a value in line with what its field accepts as you type (or from an older saved draft). */
function sanitize(field: Field, value: string) {
  if (field === "phone") return cleanPhone(value);
  if (field === "name") return value.slice(0, NAME_MAX);
  if (field === "message") return value.slice(0, MESSAGE_MAX);
  return value;
}

/* Every field shares the same look and behaviour; only these details differ. */
type FieldProps = {
  label: string;
  placeholder: string;
  span?: boolean;
  type?: string;
  inputMode?: "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
};
const FIELD_PROPS: Record<Field, FieldProps> = {
  name: { label: "Name", placeholder: "Your name", autoComplete: "name", maxLength: NAME_MAX, span: true },
  email: { label: "Gmail", placeholder: "you@gmail.com", type: "email", inputMode: "email", autoComplete: "email" },
  phone: {
    label: "Phone",
    placeholder: "0612345678 or +212…",
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    // No maxLength: pasting "06 12 34 56 78" must not be cut before cleanPhone strips the spaces.
  },
  message: {
    label: "Your project",
    placeholder: "What are you building, and when do you need it?",
    maxLength: MESSAGE_MAX,
    span: true,
  },
};

const inputClass =
  "w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[16px] text-primary outline-none transition-[border-color,background-color] duration-300 placeholder:text-white/30 hover:border-white/25 focus:border-white/60 focus:bg-white/[0.07] aria-invalid:border-white/70";

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-cm-item className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] text-white/80">
          <CircleAlert aria-hidden className="size-3.5 shrink-0" strokeWidth={1.5} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The four-point spark from the logo, for the success burst. */
function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Project enquiry popup. Opens from any element with `data-contact` (the
 * "Let's talk" link and the "Start a Project" buttons) or `openContact()`.
 * What the visitor types is kept in local storage, so they never fill it in
 * twice; once sent, reopening shows the confirmation instead of the form.
 * Black and white, on the site's frosted glass.
 */
export default function ContactModal() {
  const baseId = useId();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("form");
  const [values, setValues] = useState<ContactDetails>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const closing = useRef(false);

  const titleId = `${baseId}-title`;
  const fieldId = (name: keyof ContactDetails) => `${baseId}-${name}`;

  /* Open from `[data-contact]` clicks (capture phase, ahead of the smooth-scroll handler) or the event. */
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const saved = loadContact();
      setValues(
        saved
          ? {
              name: sanitize("name", saved.name ?? ""),
              email: saved.email ?? "",
              phone: sanitize("phone", saved.phone ?? ""),
              message: sanitize("message", saved.message ?? ""),
            }
          : EMPTY,
      );
      setSentAt(saved?.sentAt ?? null);
      setView(saved?.sentAt ? "sent" : "form");
      setErrors({});
      setFailure(null);
      closing.current = false;
      setMounted(true);
    };
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const trigger = e.target instanceof Element ? e.target.closest("[data-contact]") : null;
      if (!trigger) return;
      e.preventDefault();
      show();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener(OPEN_CONTACT_EVENT, show);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(OPEN_CONTACT_EVENT, show);
    };
  }, []);

  /* Keep the draft in local storage while typing (not once it has been sent). */
  useEffect(() => {
    if (mounted && view === "form") saveContact(values);
  }, [mounted, view, values]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const done = () => {
      setMounted(false);
      returnFocus.current?.focus({ preventScroll: true });
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    gsap
      .timeline({ onComplete: done })
      .to(panel.current, { opacity: 0, y: 24, scale: 0.97, duration: 0.35, ease: "power2.in" }, 0)
      .to(backdrop.current, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0.05);
  }, []);

  /* Entrance, scroll lock, Escape and focus trap while open. */
  useLayoutEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (still) return;
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
        .fromTo(panel.current, { opacity: 0, y: 48, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1 }, 0.05)
        .from("[data-cm-item]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.045 }, 0.2);
    }, panel);

    const focusables = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>("button, a[href], input:not([type=checkbox]), textarea") ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>("input, [data-cm-primary]");
      first?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
    };
  }, [mounted, close]);

  /* Success: the ring and tick draw themselves and sparks burst outward. */
  useLayoutEffect(() => {
    if (!mounted || view !== "sent" || !body.current) return;
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-cm-ring], [data-cm-tick]", { strokeDashoffset: 0 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-cm-sent] > *", { opacity: 0, y: 16, duration: 0.9, stagger: 0.07 }, 0)
        .fromTo("[data-cm-ring]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0.1)
        .fromTo("[data-cm-tick]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power3.out" }, 0.85)
        .fromTo(
          "[data-cm-spark]",
          { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 },
          {
            x: (i) => Math.cos((i / SPARKS) * Math.PI * 2) * 74,
            y: (i) => Math.sin((i / SPARKS) * Math.PI * 2) * 74,
            scale: (i) => (i % 2 ? 0.6 : 1),
            rotation: 90,
            opacity: 0,
            duration: 1.4,
            stagger: 0.015,
          },
          0.9,
        )
        .fromTo("[data-cm-badge]", { scale: 1 }, { scale: 1.06, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 0.95);
    }, body);
    return () => ctx.revert();
  }, [mounted, view]);

  const update = (field: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = sanitize(field, e.target.value);
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const check = (field: Field) => () => {
    if (values[field].trim()) setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (view === "sending") return;
    const { data: details, errors: found } = validateContact(values);
    setErrors(found);
    const firstInvalid = FIELDS.find((name) => found[name]);
    if (!details || firstInvalid) {
      document.getElementById(fieldId(firstInvalid ?? "name"))?.focus();
      return;
    }
    setFailure(null);
    setView("sending");
    try {
      await sendContact(details, Boolean(honeypot.current?.checked));
      const at = new Date().toISOString();
      saveContact({ ...details, sentAt: at });
      setValues(details);
      setSentAt(at);
      setView("sent");
    } catch (error) {
      setView("form");
      setFailure(
        error instanceof ContactError && error.reason === "not-configured"
          ? "The form isn't connected yet."
          : "Something went wrong while sending.",
      );
    }
  };

  const sendAnother = () => {
    setValues((v) => ({ ...v, message: "" }));
    setSentAt(null);
    setView("form");
    requestAnimationFrame(() => document.getElementById(fieldId("message"))?.focus());
  };

  if (!mounted) return null;

  const sending = view === "sending";
  const firstName = values.name.trim().split(/\s+/)[0];
  // Only mention the date when the visitor comes back on a later day.
  const sentDate =
    sentAt && new Date(sentAt).toDateString() !== new Date().toDateString()
      ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(new Date(sentAt))
      : null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6">
      {/* Dimmed, softly blurred page behind the glass. */}
      <div ref={backdrop} aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" onClick={close} />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass glass-dark relative flex max-h-[calc(100svh-24px)] w-full max-w-[600px] flex-col overflow-hidden rounded-[28px]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-primary transition-[background-color,rotate] duration-500 ease-expo hover:rotate-90 hover:bg-white/[0.12] sm:right-5 sm:top-5"
        >
          <X aria-hidden className="size-4" strokeWidth={1.5} />
        </button>

        <div
          ref={body}
          className="relative z-[1] min-h-0 overflow-y-auto overscroll-contain p-6 pt-8 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin] sm:p-10"
        >
          <p role="status" aria-live="polite" className="sr-only">
            {sending ? "Sending your message…" : view === "sent" ? "Message sent." : failure ?? ""}
          </p>

          {view === "sent" ? (
            <div data-cm-sent className="flex flex-col items-center py-6 text-center sm:py-10">
              <div data-cm-badge className="relative grid size-24 place-items-center">
                <svg viewBox="0 0 96 96" aria-hidden className="size-24 overflow-visible">
                  <circle cx="48" cy="48" r="44" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.5" />
                  <circle
                    data-cm-ring
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="0"
                    transform="rotate(-90 48 48)"
                  />
                  <path
                    data-cm-tick
                    d="M31 49.5L43 61L65 37"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="0"
                  />
                </svg>
                {Array.from({ length: SPARKS }, (_, i) => (
                  <span key={i} data-cm-spark className="pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2 opacity-0">
                    <Spark className="size-4 text-white" />
                  </span>
                ))}
              </div>
              <h2 id={titleId} className="mt-8 font-sans text-[clamp(34px,6vw,48px)] font-medium leading-none tracking-[-0.04em]">
                Message sent
              </h2>
              <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-white/60">
                Thanks{firstName ? ` ${firstName}` : ""}, your project details
                {sentDate ? ` from ${sentDate}` : ""} are with us. We’ll reply to{" "}
                <span className="text-primary">{values.email}</span> soon.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <PillButton data-cm-primary onClick={close}>
                  Close
                </PillButton>
                <button
                  type="button"
                  onClick={sendAnother}
                  className="text-[14px] text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-primary hover:decoration-white"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} aria-busy={sending}>
              <p data-cm-item className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">
                New project
              </p>
              <h2
                id={titleId}
                data-cm-item
                className="mt-3 pr-12 font-sans text-[clamp(40px,7vw,60px)] font-medium leading-[0.95] tracking-[-0.045em]"
              >
                Let’s talk
              </h2>
              <p data-cm-item className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-white/60">
                Tell us a little about your project and how to reach you. We’ll get back to you shortly.
              </p>

              <fieldset disabled={sending} className="mt-8 grid gap-5 sm:grid-cols-2">
                {FIELDS.map((field) => {
                  const { label, span, ...props } = FIELD_PROPS[field];
                  const id = fieldId(field);
                  const error = errors[field];
                  const shared = {
                    id,
                    name: field,
                    value: values[field],
                    onChange: update(field),
                    onBlur: check(field),
                    "aria-invalid": Boolean(error),
                    "aria-describedby": error ? `${id}-error` : undefined,
                    ...props,
                  };
                  const count = values.message.length;
                  return (
                    <div key={field} className={span ? "sm:col-span-2" : undefined}>
                      <FieldShell
                        id={id}
                        label={label}
                        error={error}
                        hint={
                          field === "message" ? (
                            <span
                              className={`font-mono text-[11px] tabular-nums ${count >= MESSAGE_MAX - 20 ? "text-white/85" : "text-white/40"}`}
                            >
                              {count}/{MESSAGE_MAX}
                            </span>
                          ) : null
                        }
                      >
                        {field === "message" ? (
                          <textarea
                            rows={4}
                            {...shared}
                            className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
                          />
                        ) : (
                          <input {...shared} className={inputClass} />
                        )}
                      </FieldShell>
                    </div>
                  );
                })}
                {/* Spam trap for Web3Forms: people never see or tick it. */}
                <input ref={honeypot} type="checkbox" name="botcheck" tabIndex={-1} aria-hidden className="hidden" />
              </fieldset>

              {failure ? (
                <p
                  data-cm-item
                  className="mt-6 flex items-start gap-2 rounded-2xl border border-white/20 bg-white/[0.05] px-4 py-3 text-[14px] leading-relaxed text-white/85"
                >
                  <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    {failure} Please try again, or email us at{" "}
                    <a href={CONTACT_EMAIL_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </span>
                </p>
              ) : null}

              <div data-cm-item className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <PillButton
                  type="submit"
                  disabled={sending}
                  icon={sending ? <LoaderCircle className="size-4 animate-spin" strokeWidth={1.5} /> : undefined}
                  className="disabled:pointer-events-none disabled:opacity-70"
                >
                  {sending ? "Sending…" : "Send message"}
                </PillButton>
                <p className="text-[13px] leading-relaxed text-white/45 sm:max-w-[26ch] sm:text-right">
                  Saved on this device, so you won’t have to type it twice.
                </p>
              </div>

              <p data-cm-item className="mt-8 border-t border-white/10 pt-6 text-[13px] text-white/50">
                Prefer email?{" "}
                <a
                  href={CONTACT_EMAIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/85 underline-offset-4 hover:underline"
                >
                  {CONTACT_EMAIL}
                  <span className="sr-only"> (opens Gmail in a new tab)</span>
                </a>
                <span aria-hidden className="mx-2 text-white/25">
                  ·
                </span>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/85 underline-offset-4 hover:underline"
                >
                  {INSTAGRAM_HANDLE}
                  <span className="sr-only"> on Instagram (opens in a new tab)</span>
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
