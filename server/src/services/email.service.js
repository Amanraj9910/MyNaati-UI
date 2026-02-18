/**
 * =============================================================================
 * MyNaati Backend — Email Service
 * =============================================================================
 * 
 * Handles sending emails using Nodemailer.
 * Configured for Gmail SMTP but can be adapted for others.
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a password reset email to the user.
 * 
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - The password reset link
 */
async function sendPasswordResetEmail(to, resetUrl) {
    try {
        const mailOptions = {
            from: `"MyNaati Support" <${process.env.SMTP_USER}>`,
            to: to,
            subject: 'MyNaati - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your MyNaati account.</p>
                    <p>Click the button below to reset your password. This link is valid for 5 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>Best regards,<br>MyNaati Team</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Password reset email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        throw new Error('Failed to send email');
    }
}

module.exports = {
    sendPasswordResetEmail,
};
