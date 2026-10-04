import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'campusbite-secure-otp-secret-key-2026';

export interface OtpPayload {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed OTP verification token.
 * Validates across serverless instances without requiring external cache infrastructure.
 */
export function generateOtpToken(phoneNumber: string, otp: string, expiresInMinutes = 10): { token: string; expiresAt: number } {
  const cleanPhone = String(phoneNumber).replace(/\D/g, '').slice(-10);
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const data = `${cleanPhone}:${otp}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
  const token = Buffer.from(JSON.stringify({ phone: cleanPhone, expiresAt, hmac })).toString('base64');
  return { token, expiresAt };
}

/**
 * Verifies if the entered OTP matches the cryptographically signed token and has not expired.
 */
export function verifyOtpToken(phoneNumber: string, enteredOtp: string, token: string): { valid: boolean; reason?: string } {
  try {
    const cleanPhone = String(phoneNumber).replace(/\D/g, '').slice(-10);
    const cleanOtp = String(enteredOtp).trim();

    if (!token) {
      return { valid: false, reason: 'Missing verification token. Please request a new OTP.' };
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { phone, expiresAt, hmac } = decoded;

    if (phone !== cleanPhone) {
      return { valid: false, reason: 'Phone number mismatch. Please request a new OTP.' };
    }

    if (Date.now() > Number(expiresAt)) {
      return { valid: false, reason: 'OTP has expired. Please request a new OTP.' };
    }

    const expectedData = `${cleanPhone}:${cleanOtp}:${expiresAt}`;
    const expectedHmac = crypto.createHmac('sha256', OTP_SECRET).update(expectedData).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return { valid: true };
    } else {
      return { valid: false, reason: 'Invalid OTP code. Please enter the correct 6-digit code sent to your phone.' };
    }
  } catch (err) {
    return { valid: false, reason: 'Verification failed. Please request a new OTP.' };
  }
}
