const nodemailer = require('nodemailer');
const { logger } = require('./logger');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    logger.info(`📧 Email sent to ${to} - Message ID: ${info.messageId}`);
  } catch (err) {
    logger.error(`❌ Failed to send email to ${to}: ${err.message}`);
    throw new Error('Email delivery failed');
  }
};

module.exports = sendEmail;
