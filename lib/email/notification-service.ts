// lib/email/notification-service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendNotificationEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: 'Owtras <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (data.error) {
      console.error('Email service error:', data.error)
      return { success: false, error: data.error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email service error:', error)
    return { success: false, error }
  }
}

export async function sendAccountHibernatedEmail(email: string, userName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Account Hibernated</h2>
      <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #666; font-size: 16px;">Your Owtras account has been temporarily hibernated.</p>
      <p style="color: #666; font-size: 16px;">You can reactivate it anytime by signing in with your email and password.</p>
      <p style="color: #666; font-size: 16px;">We hope to see you back soon! 👋</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">© Owtras. All rights reserved.</p>
    </div>
  `

  return sendNotificationEmail({
    to: email,
    subject: 'Your Owtra account has been hibernated',
    html,
  })
}

export async function sendAccountDeletedEmail(email: string, userName: string, deletionDate: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Account Deletion Scheduled</h2>
      <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #666; font-size: 16px;">Your Owtra account has been scheduled for deletion on <strong>${deletionDate}</strong>.</p>
      <p style="color: #666; font-size: 16px;">You have 30 days to change your mind. If you want to reactivate your account, just sign in before the deletion date.</p>
      <p style="color: #666; font-size: 16px;">All your data will be permanently removed after this date.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">© Owtra. All rights reserved.</p>
    </div>
  `

  return sendNotificationEmail({
    to: email,
    subject: 'Your Owtra account deletion is scheduled',
    html,
  })
}