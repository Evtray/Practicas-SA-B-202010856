import nodemailer from 'nodemailer';
import { config } from '../config/env';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
    tls: {
      rejectUnauthorized: false, // For Gmail with app passwords
    },
  });

  static async sendVerificationEmail(email: string, token: string): Promise<any> {
    const verificationUrl = `${config.frontend.url}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to: email,
      subject: '✅ Verify Your Email Address - SA Lab Auth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SA Lab Authentication</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Email Verification Required</h2>
            <p style="color: #666; font-size: 16px;">
              Thank you for registering! Please click the button below to verify your email address:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #666; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            © 2025 SA Lab Authentication System | USAC
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent:', info.messageId);
      console.log('📧 Sent to:', email);
      return info;
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      // Don't throw error to prevent registration failure
      // In production, you might want to retry or queue the email
      return null;
    }
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to: email,
      subject: '🔐 Password Reset Request - SA Lab Auth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Reset Your Password</h2>
            <p style="color: #666; font-size: 16px;">
              You requested a password reset. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #666; background: #f0f0f0; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
          <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            © 2025 SA Lab Authentication System | USAC
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static async send2FABackupCodes(email: string, backupCodes: string[]): Promise<any> {
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to: email,
      subject: '🔒 Your 2FA Backup Codes - SA Lab Auth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Two-Factor Authentication</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Your Backup Codes</h2>
            <p style="color: #666; font-size: 16px;">
              Here are your backup codes for two-factor authentication. <strong>Keep them in a safe place!</strong>
            </p>
            <div style="background: white; border: 2px dashed #667eea; padding: 20px; border-radius: 5px; margin: 20px 0;">
              ${backupCodes.map(code => `
                <code style="display: block; font-size: 18px; margin: 8px 0; font-family: 'Courier New', monospace; color: #333; text-align: center; letter-spacing: 2px;">
                  ${code}
                </code>
              `).join('')}
            </div>
            <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">📋 How to use backup codes:</h3>
              <ul style="color: #155724; font-size: 14px;">
                <li>Each code can only be used once</li>
                <li>Use them when you can't access Google Authenticator</li>
                <li>Store them securely (password manager recommended)</li>
                <li>Generate new codes after using most of them</li>
              </ul>
            </div>
            <div style="background: #f8d7da; border: 1px solid #dc3545; padding: 15px; border-radius: 5px;">
              <p style="color: #721c24; margin: 0; font-size: 14px;">
                <strong>⚠️ Security Warning:</strong> Never share these codes with anyone. SA Lab staff will never ask for your backup codes.
              </p>
            </div>
          </div>
          <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
            © 2025 SA Lab Authentication System | USAC
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ 2FA backup codes sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Error sending 2FA backup codes:', error);
      // Don't throw - backup codes can be shown in UI
      return null;
    }
  }

  // Test email connection
  static async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      console.log('📧 Using:', config.email.user);
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}