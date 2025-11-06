require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(toEmail, verificationToken) {
  const mailOptions = {
    from: `"Acme" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify Your Email",
    html: `
      <h3>Welcome!</h3>
      <p>Use the following code to verify your email:</p>
      <h2>${verificationToken}</h2>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending verification email:", err);
    throw err;
  }
}

module.exports = sendVerificationEmail;
