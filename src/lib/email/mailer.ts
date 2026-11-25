import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { getAppUrl } from "@/lib/env";

export interface LessonStartedEmailPayload {
  toEmail: string;
  studentName: string;
  universityRank: number;
  universityName: string;
  directionTitle: string;
  dayNumber: number;
  windowLabel: string;
}

interface OutboxEmailEntry extends LessonStartedEmailPayload {
  subject: string;
  sentVia: "smtp" | "resend" | "outbox-log";
  sentAt: string;
}

async function appendOutboxLog(entry: OutboxEmailEntry): Promise<void> {
  try {
    const dir = path.join(process.cwd(), "data");
    const filePath = path.join(dir, "outbox-emails.json");
    await mkdir(dir, { recursive: true });
    let list: OutboxEmailEntry[] = [];
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
    list.unshift(entry);
    await writeFile(filePath, JSON.stringify(list.slice(0, 100), null, 2), "utf8");
  } catch {
    // ignore read-only fs
  }
}

export async function sendLessonStartedEmail(
  payload: LessonStartedEmailPayload,
): Promise<{ ok: boolean; transport: "smtp" | "resend" | "outbox-log" }> {
  const appUrl = getAppUrl();
  const lessonUrl = `${appUrl}/dars`;
  const subject = `Dars boshlandi! · Flux (${payload.dayNumber}-kun, 2 soatlik AI dars)`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0b0b0c;color:#ffffff;padding:32px;border-radius:20px;max-width:560px;margin:0 auto;border:1px solid rgba(198,244,50,0.35);">
      <div style="display:inline-block;background:rgba(198,244,50,0.15);color:#c6f432;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.06em;">
        FLUX CAMPUS · DARS BOSHLANDI
      </div>
      <h1 style="margin:18px 0 10px;font-size:24px;color:#ffffff;">
        Salom, ${payload.studentName}! Darsingiz boshlandi.
      </h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#d4d4d8;">
        Bugungi <strong>2 soatlik</strong> jonli AI darsingiz ochildi. Belgilangan vaqt tugamasidan to'liq ekranli darsga kiring:
      </p>
      <div style="background:#121214;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:16px;margin-bottom:22px;font-size:14px;color:#e4e4e7;">
        <div><strong>Universitet:</strong> #${payload.universityRank} ${payload.universityName}</div>
        <div style="margin-top:6px;"><strong>Yo'nalish:</strong> ${payload.directionTitle}</div>
        <div style="margin-top:6px;"><strong>Dars vaqti:</strong> ${payload.windowLabel} (2 soat)</div>
      </div>
      <a href="${lessonUrl}" style="display:inline-block;background:#c6f432;color:#0b0b0c;text-decoration:none;font-weight:800;font-size:15px;padding:14px 26px;border-radius:12px;">
        Darsga kirish →
      </a>
    </div>
  `;

  const text = [
    `Salom, ${payload.studentName}!`,
    `Dars boshlandi! Bugungi 2 soatlik Flux AI darsingiz ochildi.`,
    `Universitet: #${payload.universityRank} ${payload.universityName}`,
    `Yo'nalish: ${payload.directionTitle}`,
    `Dars vaqti: ${payload.windowLabel} (2 soat)`,
    `Darsga kirish: ${lessonUrl}`,
  ].join("\n");

  const fromAddress =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "Flux Campus <onboarding@resend.dev>";

  // 1. SMTP Transport (Gmail, Brevo, Mailgun, Custom SMTP)
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const port = Number(process.env.SMTP_PORT ?? 465) || 465;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: payload.toEmail,
        subject,
        text,
        html,
      });

      await appendOutboxLog({
        ...payload,
        subject,
        sentVia: "smtp",
        sentAt: new Date().toISOString(),
      });
      return { ok: true, transport: "smtp" };
    } catch (err) {
      console.warn("[mailer] SMTP send error:", err);
    }
  }

  // 2. Resend HTTP API
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [payload.toEmail],
          subject,
          html,
          text,
        }),
      });
      if (res.ok) {
        await appendOutboxLog({
          ...payload,
          subject,
          sentVia: "resend",
          sentAt: new Date().toISOString(),
        });
        return { ok: true, transport: "resend" };
      }
    } catch (err) {
      console.warn("[mailer] Resend error:", err);
    }
  }

  // 3. Local Dev Outbox Record + Console Notification
  console.info(
    `[Flux Email -> ${payload.toEmail}] "${subject}" (${payload.windowLabel})`,
  );
  await appendOutboxLog({
    ...payload,
    subject,
    sentVia: "outbox-log",
    sentAt: new Date().toISOString(),
  });
  return { ok: true, transport: "outbox-log" };
}
