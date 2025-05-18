const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address from .env
    pass: process.env.EMAIL_PASS, // Your email password or app password from .env
  },
});

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body (optional)
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Juice Bar System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification email to customers about their order status
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @param {string} tokenNumber - Order token number
 * @param {string} status - Order status (e.g., "ready", "processing")
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendOrderStatusEmail = async (customerEmail, customerName, tokenNumber, status) => {
  let subject = '';
  let text = '';
  let html = '';

  switch (status) {
    case 'ready':
      subject = `Your Juice Bar Order #${tokenNumber} is Ready for Pickup!`;
      text = `Dear ${customerName},\n\nYour order (Token #${tokenNumber}) is now ready for pickup. Please visit our juice bar with your token number to collect your order.\n\nThank you for choosing our Juice Bar!\n\nBest regards,\nThe Juice Bar Team`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #166d67;">Your Juice Bar Order is Ready! 🥤</h2>
          <p>Dear ${customerName},</p>
          <p>Great news! Your order with token number <strong style="background-color: #f5f5f5; padding: 3px 8px; border-radius: 3px;">#${tokenNumber}</strong> is now ready for pickup.</p>
          <p>Please visit our juice bar with your token number to collect your freshly prepared juice.</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Order Token: #${tokenNumber}</p>
          </div>
          <p>Thank you for choosing our Juice Bar!</p>
          <p>Best regards,<br>The Juice Bar Team</p>
        </div>
      `;
      break;
    case 'processing':
      subject = `Your Juice Bar Order #${tokenNumber} is Being Prepared`;
      text = `Dear ${customerName},\n\nYour order (Token #${tokenNumber}) is currently being prepared. We'll notify you when it's ready for pickup.\n\nThank you for your patience!\n\nBest regards,\nThe Juice Bar Team`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #166d67;">Your Juice Bar Order is Being Prepared 🍹</h2>
          <p>Dear ${customerName},</p>
          <p>Your order with token number <strong style="background-color: #f5f5f5; padding: 3px 8px; border-radius: 3px;">#${tokenNumber}</strong> is currently being prepared.</p>
          <p>We'll notify you as soon as it's ready for pickup.</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Order Token: #${tokenNumber}</p>
          </div>
          <p>Thank you for your patience!</p>
          <p>Best regards,<br>The Juice Bar Team</p>
        </div>
      `;
      break;
    default:
      subject = `Update on Your Juice Bar Order #${tokenNumber}`;
      text = `Dear ${customerName},\n\nThere is an update on your order (Token #${tokenNumber}): ${status}.\n\nThank you for choosing our Juice Bar!\n\nBest regards,\nThe Juice Bar Team`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #166d67;">Update on Your Juice Bar Order 🥤</h2>
          <p>Dear ${customerName},</p>
          <p>There is an update on your order with token number <strong style="background-color: #f5f5f5; padding: 3px 8px; border-radius: 3px;">#${tokenNumber}</strong>:</p>
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Status: ${status}</p>
            <p style="margin: 5px 0 0 0;">Order Token: #${tokenNumber}</p>
          </div>
          <p>Thank you for choosing our Juice Bar!</p>
          <p>Best regards,<br>The Juice Bar Team</p>
        </div>
      `;
  }

  return sendEmail({
    to: customerEmail,
    subject,
    text,
    html,
  });
};

/**
 * Send welcome email to newly registered customer
 * @param {string} customerEmail - Customer's email address
 * @param {string} customerName - Customer's name
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendWelcomeEmail = async (customerEmail, customerName) => {
  const subject = 'Welcome to Juice Bar!';
  const text = `Dear ${customerName},\n\nWelcome to our Juice Bar! Thank you for registering with us. We're excited to have you as a customer and look forward to serving you delicious, fresh juices.\n\nBest regards,\nThe Juice Bar Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #166d67;">Welcome to Juice Bar! 🍹</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for registering with our Juice Bar system!</p>
      <p>We're excited to have you as a customer and look forward to serving you delicious, fresh juices.</p>
      <p>With our online system, you can:</p>
      <ul>
        <li>Browse our menu of fresh juice options</li>
        <li>Place orders online for pickup</li>
        <li>Receive notifications when your order is ready</li>
        <li>Provide feedback on your experience</li>
      </ul>
      <p>Feel free to visit our juice bars located on campus anytime!</p>
      <p>Best regards,<br>The Juice Bar Team</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendOrderStatusEmail,
  sendWelcomeEmail,
};