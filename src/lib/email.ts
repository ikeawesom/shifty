import nodemailer from 'nodemailer'

type ShiftSummaryItem = { title: string; startsAt: Date; endsAt: Date | null }

function formatUtc(d: Date): string {
  return d.toLocaleString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' UTC'
}

function shiftListHtml(shifts: ShiftSummaryItem[]): string {
  return shifts
    .map(
      (s) =>
        `<li style="margin-bottom:6px"><strong>${s.title}</strong> — ${formatUtc(s.startsAt)}${s.endsAt ? ` → ${formatUtc(s.endsAt)}` : ''}</li>`
    )
    .join('')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendInviteEmail({
  to,
  orgName,
  inviterName,
  inviteUrl,
}: {
  to: string
  orgName: string
  inviterName: string
  inviteUrl: string
}) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `You've been invited to join ${orgName} on Shifty`,
    html: `
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Shifty.</p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 20px;background:#000;color:#fff;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
      <p style="color:#888;font-size:12px;">This link expires in 7 days. If you weren't expecting this, you can ignore it.</p>
    `,
  })
}

export async function sendDailySummaryEmail({
  to,
  orgName,
  shifts,
}: {
  to: string
  orgName: string
  shifts: ShiftSummaryItem[]
}) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Today's shifts — ${orgName}`,
    html: `
      <p>Hi there,</p>
      <p>Here's a summary of all shifts scheduled today for <strong>${orgName}</strong>:</p>
      <ul>${shiftListHtml(shifts)}</ul>
      <p style="color:#888;font-size:12px;">You're receiving this because your organisation has daily reminders enabled.</p>
    `,
  })
}

export async function sendPersonalShiftSummaryEmail({
  to,
  orgName,
  shifts,
}: {
  to: string
  orgName: string
  shifts: ShiftSummaryItem[]
}) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Your shifts today — ${orgName}`,
    html: `
      <p>Hi there,</p>
      <p>You have the following shift${shifts.length > 1 ? 's' : ''} scheduled today in <strong>${orgName}</strong>:</p>
      <ul>${shiftListHtml(shifts)}</ul>
      <p style="color:#888;font-size:12px;">You're receiving this because you're assigned to shifts today.</p>
    `,
  })
}

export async function sendPreShiftReminderEmail({
  to,
  orgName,
  shiftTitle,
  startsAt,
}: {
  to: string
  orgName: string
  shiftTitle: string
  startsAt: Date
}) {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Reminder: "${shiftTitle}" starts soon`,
    html: `
      <p>Hi there,</p>
      <p>This is a reminder that your shift <strong>${shiftTitle}</strong> in <strong>${orgName}</strong> starts at <strong>${formatUtc(startsAt)}</strong>.</p>
      <p style="color:#888;font-size:12px;">You're receiving this because your organisation has pre-shift alerts enabled.</p>
    `,
  })
}
