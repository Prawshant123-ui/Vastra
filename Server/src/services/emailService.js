const axios = require("axios");

const brevo = axios.create({
  baseURL: "https://api.brevo.com/v3",
  headers: {
    "api-key": process.env.BREVO_API_KEY,
    "Content-Type": "application/json",
  },
});

const sendEmail = async (to, subject, html) => {
  await brevo.post("/smtp/email", {
    sender: { name: "MyApp", email: process.env.EMAIL_FROM },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Verify your email address",
    `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a202c">Verify Your Email</h2>
        <p>Click the button below to verify your email.
           This link expires in <strong>24 hours</strong>.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#2E5FA3;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#718096;font-size:13px">
          If you didn't create an account, ignore this email.
        </p>
      </div>
    `
  );
};

const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Password Reset Request",
    `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a202c">Reset Your Password</h2>
        <p>Click below to reset your password.
           This link expires in <strong>1 hour</strong>.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#C0392B;
                  color:#fff;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#718096;font-size:13px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `
  );
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };