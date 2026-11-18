/**
 * FIXUP EMAIL & NOTIFICATION SERVICE (emailService.js)
 * Supports SMTP (NodeMailer / SendGrid) with secure environment variables.
 * In development, if SMTP credentials are not configured, it explicitly warns
 * and outputs the message body to server logs rather than silently failing.
 */

const nodemailer = null; // Can be loaded via require('nodemailer') if installed

class EmailService {
  constructor() {
    this.isConfigured = Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    if (this.isConfigured) {
      console.log('✅ Fixup Email Service: Live SMTP credentials detected.');
    } else {
      console.log('⚠️ Fixup Email Service: SMTP credentials not set in environment. Running in development logger mode.');
    }
  }

  async sendMail({ to, subject, html, text }) {
    if (!to || !subject) {
      throw new Error('Missing recipient or subject for email notification.');
    }

    if (!this.isConfigured) {
      console.log(`\n================== [OUTGOING FIXUP NOTIFICATION] ==================`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY: ${text || html}`);
      console.log(`STATUS: [DEV_LOGGED - Configure SMTP_HOST/USER/PASS in .env for live dispatch]`);
      console.log(`====================================================================\n`);
      return { success: true, mode: 'DEV_LOGGED', recipient: to };
    }

    // Live transport would send here when SMTP is provided
    try {
      const transporter = require('nodemailer').createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Fixup Home Services" <no-reply@fixup.in>',
        to,
        subject,
        text,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('SMTP Delivery Error:', err.message);
      throw err;
    }
  }

  // Helper Templates
  async sendRegistrationOtp(to, otpCode, role) {
    return this.sendMail({
      to,
      subject: `Your Fixup Account Verification OTP: ${otpCode}`,
      text: `Your 6-digit verification code is: ${otpCode}. It expires in 5 minutes. Do not share this OTP with anyone.`
    });
  }

  async sendBookingConfirmation(to, booking) {
    return this.sendMail({
      to,
      subject: `Booking Confirmed: ${booking.serviceName} (${booking.id})`,
      text: `Hello ${booking.customerName}, your request for ${booking.serviceName} is confirmed for ${booking.date} (${booking.timeSlot}). Total amount: ₹${booking.totalAmount}.`
    });
  }

  async sendKycReminder(to, providerName, daysRemaining) {
    return this.sendMail({
      to,
      subject: `Urgent: Mandatory 15-Day KYC Audit Due in ${daysRemaining} Days`,
      text: `Dear ${providerName}, your recurring 15-day identity & police audit is due in ${daysRemaining} days. Please verify your profile to remain eligible for customer dispatches.`
    });
  }
}

module.exports = new EmailService();
