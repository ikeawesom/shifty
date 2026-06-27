import nodemailer from 'nodemailer'

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
