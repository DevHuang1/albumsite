require("dotenv").config();
const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Send verification email
async function sendVerificationEmail(toEmail, token) {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: toEmail,
    subject: "Verify Your Email Address Now",
    html: `Verify your email address with this token: ${token}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

module.exports = sendVerificationEmail;
