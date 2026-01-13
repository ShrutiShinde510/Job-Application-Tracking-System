const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create transporter
    console.log(`📡 Attempting to send email to: ${options.email}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s/g, ''), // Strip all spaces
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    console.log(`📤 Sending email: From: ${mailOptions.from}, To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email error:', error);
    // Throw error so caller knows email failed
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// OTP Email Template
const sendOTPEmail = async (email, otp, name) => {
  console.log(`📨 Trace: sendOTPEmail called for ${email}`);
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 JobTracker</h1>
          <p>Email Verification</p>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for registering with JobTracker. Please use the following OTP to verify your email address:</p>
          <div class="otp">${otp}</div>
          <p><strong>This OTP is valid for 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 JobTracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: 'Verify Your Email - JobTracker',
    message
  });
};

module.exports = { sendEmail, sendOTPEmail };