'use server'
import nodemailer from 'nodemailer'

export const onMailer = async (email: string) => {
  try {
    if (!email || typeof email !== 'string') return { status: 400 }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      to: email,
      subject: 'Domainly AI — Live Support Activated',
      text: 'One of your customers on Domainly AI just switched to real-time support mode. Head to your dashboard to respond.',
    }

    const info = await transporter.sendMail(mailOptions)
    return { status: 200, id: info.messageId }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}
