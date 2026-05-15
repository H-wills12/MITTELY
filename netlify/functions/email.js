/* MITTELY Email Service - Complete Gmail SMTP Integration */

const nodemailer = require('nodemailer');

// Create email transporter using Gmail SMTP
function createTransporter() {
  const emailUser = process.env.NOREPLY_EMAIL || process.env.ADMIN_EMAIL;
  const emailPass = process.env.GMAIL_APP_PASSWORD;
  
  // Development mode - log emails instead of sending
  if (!emailUser || !emailPass || emailPass === 'xxxx xxxx xxxx xxxx' || emailPass === 'your-16-character-app-password') {
    console.warn('⚠️ Email credentials not configured. Running in MOCK mode.');
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 [MOCK EMAIL] ==================================');
        console.log(`   To: ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        console.log(`   Text: ${mailOptions.text?.substring(0, 200) || 'No text'}`);
        console.log('   ================================================');
        return { messageId: 'mock-' + Date.now(), accepted: [mailOptions.to], rejected: [] };
      }
    };
  }
  
  // Production mode - use real Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  });
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Gmail SMTP connection failed:', error.message);
    } else {
      console.log('✅ Gmail SMTP ready to send emails');
    }
  });
  
  return transporter;
}

/**
 * Send email using configured transporter
 */
async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const fromEmail = process.env.NOREPLY_EMAIL || process.env.ADMIN_EMAIL;
  const fromName = 'MITTELY';
  
  if (!to) {
    throw new Error('Recipient email is required');
  }
  
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: to,
    subject: subject,
    text: text || stripHtml(html),
    html: html,
    replyTo: process.env.ADMIN_EMAIL || fromEmail,
    headers: {
      'X-Entity-Ref-ID': `mittely-${Date.now()}`,
      'X-Mailer': 'MITTELY Email Service v1.0'
    }
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: "${subject}" (${info.messageId})`);
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Welcome Email Template
 */
function welcomeTemplate(name) {
  const appUrl = process.env.APP_URL || 'https://mittely.netlify.app';
  const currentYear = new Date().getFullYear();
  const displayName = name || 'Creator';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MITTELY</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #111827;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .header {
      background: linear-gradient(135deg, #6366f1, #ec4899);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      color: white;
      text-decoration: none;
      letter-spacing: -0.5px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .logo span { color: #818cf8; }
    .header h1 {
      color: white;
      font-size: 28px;
      margin: 0 0 10px;
      font-weight: 800;
    }
    .header p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
      color: #f1f5f9;
    }
    .content h2 {
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .content p {
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .features {
      background: #1f2937;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
    }
    .features h3 {
      color: #818cf8;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
      color: #cbd5e1;
    }
    .features li {
      margin-bottom: 10px;
      line-height: 1.5;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #0f172a;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .footer p {
      color: #64748b;
      font-size: 12px;
      margin: 5px 0;
    }
    .footer a {
      color: #818cf8;
      text-decoration: none;
    }
  </style>
</head>
<body style="margin:0;padding:20px;background:#0b0f19;">
  <div class="container">
    <div class="header">
      <div class="logo">MITTELY<span>.</span></div>
      <h1>Welcome to MITTELY! 🎉</h1>
      <p>Your journey to premium digital assets begins here</p>
    </div>
    <div class="content">
      <h2>Hi ${displayName}! 👋</h2>
      <p>Thank you for joining MITTELY. We're thrilled to have you on board. You now have access to our growing collection of premium digital assets — all designed to help you build amazing digital experiences.</p>
      
      <div class="features">
        <h3>✨ Here's what you can do with MITTELY:</h3>
        <ul>
          <li>Browse and purchase premium UI kits, templates, and illustrations</li>
          <li>Pay securely with Paystack or Heleket</li>
          <li>Download your purchased assets instantly</li>
          <li>Track all your transactions in your personal dashboard</li>
          <li>Get lifetime updates for purchased assets</li>
        </ul>
      </div>
      
      <p>Ready to explore our collection? Click the button below to start browsing.</p>
      
      <div style="text-align: center;">
        <a href="${appUrl}#products" class="button">Browse Assets →</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">If you have any questions or need assistance, simply reply to this email. Our support team is here to help 24/7.</p>
    </div>
    <div class="footer">
      <p>© ${currentYear} MITTELY. All rights reserved.</p>
      <p>Building digital experiences that matter.</p>
      <p>
        <a href="${appUrl}">Home</a> | 
        <a href="${appUrl}#products">Products</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Receipt Email Template
 */
function receiptTemplate(order) {
  const appUrl = process.env.APP_URL || 'https://mittely.netlify.app';
  const downloadUrl = `${appUrl}/download.html?token=${order.download_token}&order=${order.id}`;
  const currentYear = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your MITTELY Order Receipt</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #0b0f19;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #111827;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .header {
      background: linear-gradient(135deg, #10b981, #059669);
      padding: 40px 30px;
      text-align: center;
    }
    .check {
      width: 64px;
      height: 64px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      font-size: 32px;
    }
    .header h1 {
      color: white;
      font-size: 26px;
      margin: 0 0 8px;
    }
    .content {
      padding: 35px 30px;
    }
    .order-box {
      background: #1f2937;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; }
    .value { color: #f1f5f9; font-weight: 600; }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #ec4899);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 600;
      margin-top: 20px;
    }
    .footer {
      background: #0f172a;
      padding: 25px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="check">✓</div>
      <h1>Payment Successful! 🎉</h1>
      <p>Your order has been confirmed</p>
    </div>
    <div class="content">
      <p>Dear ${order.customer_name || 'Valued Customer'},</p>
      <p>Thank you for your purchase! Your payment has been successfully processed.</p>
      
      <div class="order-box">
        <div class="row"><span class="label">Order ID</span><span class="value">${order.id}</span></div>
        <div class="row"><span class="label">Product</span><span class="value">${order.product_name}</span></div>
        <div class="row"><span class="label">Amount</span><span class="value">$${order.amount.toFixed(2)}</span></div>
        <div class="row"><span class="label">Gateway</span><span class="value">${order.gateway === 'paystack' ? 'Paystack' : 'Heleket'}</span></div>
      </div>
      
      <div style="text-align: center;">
        <a href="${downloadUrl}" class="button">📥 Download Your Asset</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${currentYear} MITTELY. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Admin Alert Email Template
 */
function adminAlertTemplate(order) {
  const appUrl = process.env.APP_URL || 'https://mittely.netlify.app';
  const currentYear = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Sale on MITTELY!</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #0b0f19;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #111827;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      padding: 35px 30px;
      text-align: center;
    }
    .header h1 { color: white; margin: 0; }
    .content { padding: 35px 30px; }
    .order-box {
      background: #1f2937;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .button {
      display: inline-block;
      background: #6366f1;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .footer {
      background: #0f172a;
      padding: 25px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Sale on MITTELY!</h1>
    </div>
    <div class="content">
      <p><strong>A customer just made a purchase!</strong></p>
      
      <div class="order-box">
        <div class="row"><span>Order ID:</span><span><strong>${order.id}</strong></span></div>
        <div class="row"><span>Product:</span><span><strong>${order.product_name}</strong></span></div>
        <div class="row"><span>Customer:</span><span><strong>${order.customer_email}</strong></span></div>
        <div class="row"><span>Amount:</span><span><strong>$${order.amount.toFixed(2)}</strong></span></div>
        <div class="row"><span>Gateway:</span><span><strong>${order.gateway}</strong></span></div>
      </div>
      
      <div style="text-align: center;">
        <a href="${appUrl}/admin.html" class="button">Go to Admin Panel</a>
      </div>
    </div>
    <div class="footer">
      <p>© ${currentYear} MITTELY Admin Alert</p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { 
  sendEmail, 
  welcomeTemplate, 
  receiptTemplate, 
  adminAlertTemplate 
};