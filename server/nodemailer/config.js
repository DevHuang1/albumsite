require("dotenv").config();
const nodemailer = require("nodemailer");
const {
  verificationTokenEmailTemplate,
  WELCOME_EMAIL_TEMPLATE,
} = require("./emailTemplate");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendVerificationEmail(toEmail, token) {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: toEmail,
    subject: "Verify Your Email Address Now",
    html: verificationTokenEmailTemplate.replace("{verificationToken}", token),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
async function sendWelcomeEmail(email, name) {
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "Welcome to the community",
    html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}
module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};
