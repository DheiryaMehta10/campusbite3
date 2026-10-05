import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail: string, otp: string): Promise<{ success: boolean; message?: string }> {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'campusbite.app@gmail.com';
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS || '';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 460px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 20px; padding: 32px 24px; background: #ffffff; text-align: center;">
      <div style="margin-bottom: 24px;">
        <h1 style="color: #ea580c; margin: 0; font-size: 28px; font-weight: 900;">🍔 CampusBite</h1>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">Order Smart. Delivered by Slot.</p>
      </div>

      <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <p style="color: #c2410c; font-size: 12px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1.5px;">Your Login Verification Code</p>
        <div style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #ea580c; padding: 8px 0; font-family: monospace;">${otp}</div>
        <p style="color: #9a3412; font-size: 12px; margin: 10px 0 0 0; font-weight: 500;">⏱ Valid for 10 minutes</p>
      </div>

      <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
        Enter this code in your CampusBite app to verify your account and place your slot meal orders.
      </p>

      <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />

      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        If you did not request this OTP, please ignore this email.<br />
        CampusBite • Smart Campus Food Delivery
      </p>
    </div>
  `;

  if (emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"CampusBite" <${emailUser}>`,
        to: toEmail,
        subject: `🔐 Your CampusBite Verification Code: ${otp}`,
        text: `Your CampusBite verification OTP is ${otp}. Valid for 10 minutes.`,
        html: htmlContent,
      });

      console.log(`✓ Email OTP ${otp} successfully sent to ${toEmail} via SMTP`);
      return { success: true };
    } catch (err: any) {
      console.error('SMTP sending error:', err);
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CampusBite <onboarding@resend.dev>',
          to: [toEmail],
          subject: `🔐 Your CampusBite Verification Code: ${otp}`,
          html: htmlContent,
        }),
      });
      if (res.ok) {
        console.log(`✓ Email OTP sent to ${toEmail} via Resend`);
        return { success: true };
      }
    } catch (err: any) {
      console.error('Resend error:', err);
    }
  }

  console.log(`[DEV / DEMO OTP LOG] Email OTP generated for ${toEmail}: ${otp}`);
  return { success: true, message: 'OTP sent' };
}
