const { sendEmail } = require("../services/emailService");

const OWNER_EMAIL = "rabeya2802@gmail.com";

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/**
 * Handle the public contact form: forwards the message to the site owner's
 * inbox. Returns 503 if SMTP isn't configured yet.
 */
const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const sent = await sendEmail({
    to: OWNER_EMAIL,
    subject: `[Lumina Books Contact] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #047857;">New contact form message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      </div>
    `,
  });

  if (!sent) {
    return res
      .status(503)
      .json({ message: "Email is not configured on the server yet." });
  }

  res.json({ message: "Message sent." });
};

module.exports = { submitContactForm };
