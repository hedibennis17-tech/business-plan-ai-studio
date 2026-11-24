/**
 * Module email — Resend SDK
 * Envoie des emails transactionnels en français
 */

import { Resend } from "resend";

// Initialisation lazy pour éviter le crash au build si RESEND_API_KEY absent
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "Business Plan AI Studio <noreply@businessplanai.ca>";

type EmailType =
  | "PAYMENT_SUCCESS"
  | "WELCOME"
  | "TICKET_CREATED"
  | "TICKET_REPLY"
  | "ADMIN_RELANCE"
  | "PASSWORD_RESET";

interface SendEmailOptions {
  to: string;
  type: EmailType;
  subject: string;
  planTitle?: string;
  ticketId?: string;
  ticketMessage?: string;
  userName?: string;
  resetLink?: string;
  adminMessage?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const { to, type, subject } = opts;

  const html = buildHtml(opts);

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
}

function buildHtml(opts: SendEmailOptions): string {
  const { type } = opts;

  switch (type) {
    case "PAYMENT_SUCCESS":
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#16a34a">✅ Paiement confirmé !</h1>
          <p>Bonjour${opts.userName ? ` ${opts.userName}` : ""},</p>
          <p>Votre paiement a été traité avec succès. Votre plan d'affaires <strong>${opts.planTitle ?? ""}</strong> est maintenant débloqué dans son intégralité.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Accéder à mon plan</a></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="color:#6b7280;font-size:12px">Business Plan AI Studio — Canada</p>
        </div>`;

    case "WELCOME":
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#2563eb">Bienvenue sur Business Plan AI Studio 🎉</h1>
          <p>Bonjour${opts.userName ? ` ${opts.userName}` : ""},</p>
          <p>Votre compte est maintenant actif. Commencez à créer votre plan d'affaires professionnel dès maintenant.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Démarrer</a></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="color:#6b7280;font-size:12px">Business Plan AI Studio — Canada</p>
        </div>`;

    case "TICKET_CREATED":
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#7c3aed">Votre demande de support a été reçue</h1>
          <p>Bonjour${opts.userName ? ` ${opts.userName}` : ""},</p>
          <p>Nous avons bien reçu votre ticket de support <strong>#${opts.ticketId ?? ""}</strong>. Notre équipe vous répondra dans les plus brefs délais.</p>
          <p style="background:#f3f4f6;padding:16px;border-radius:6px;border-left:4px solid #7c3aed">${opts.ticketMessage ?? ""}</p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="color:#6b7280;font-size:12px">Business Plan AI Studio — Canada</p>
        </div>`;

    case "TICKET_REPLY":
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#7c3aed">Réponse à votre ticket #${opts.ticketId ?? ""}</h1>
          <p>Bonjour${opts.userName ? ` ${opts.userName}` : ""},</p>
          <p>Notre équipe a répondu à votre demande de support :</p>
          <p style="background:#f3f4f6;padding:16px;border-radius:6px;border-left:4px solid #7c3aed">${opts.ticketMessage ?? ""}</p>
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard/support" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Voir ma demande</a></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="color:#6b7280;font-size:12px">Business Plan AI Studio — Canada</p>
        </div>`;

    case "ADMIN_RELANCE":
      return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="color:#ea580c">Votre plan d'affaires vous attend 📋</h1>
          <p>Bonjour${opts.userName ? ` ${opts.userName}` : ""},</p>
          <p>Vous avez commencé à créer votre plan d'affaires sur Business Plan AI Studio. Ne laissez pas votre projet en pause !</p>
          ${opts.adminMessage ? `<p style="background:#fff7ed;padding:16px;border-radius:6px;border-left:4px solid #ea580c">${opts.adminMessage}</p>` : ""}
          <p><a href="${process.env.NEXTAUTH_URL}/dashboard" style="background:#ea580c;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Reprendre mon plan</a></p>
          <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb"/>
          <p style="color:#6b7280;font-size:12px">Business Plan AI Studio — Canada</p>
        </div>`;

    default:
      return `<p>${opts.subject}</p>`;
  }
}
