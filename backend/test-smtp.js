/**
 * One-off script: verify Gmail SMTP credentials work by sending a test email.
 *   node test-smtp.js
 *
 * Safe to delete after testing.
 */
require("dotenv").config();
const { sendEmail } = require("./src/services/emailService");

(async () => {
  const to = process.env.EMAIL_USER;
  console.log("📧 Sending test email to:", to);

  try {
    const ok = await sendEmail({
      to,
      subject: "Lumina Books SMTP test ✅",
      text: "This is a test email from Lumina Books. If you received it, Gmail SMTP is configured correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #d97706;">Lumina Books SMTP test ✅</h2>
          <p>If you received this email, your Gmail SMTP setup is working correctly!</p>
          <p>You can now use email verification and password reset features.</p>
        </div>
      `,
    });

    if (ok) {
      console.log("✅ Test email sent successfully! Check your inbox (and spam folder).");
    } else {
      console.log("⚠️  SMTP not configured (EMAIL_* vars missing). Nothing was sent.");
    }
  } catch (err) {
    console.error("❌ Failed to send test email:", err.message);
    if (err.responseCode) {
      console.error("   Response code:", err.responseCode);
    }
    console.error("\nCommon fixes:");
    console.error(" - Make sure 2-Step Verification is ON");
    console.error(" - Use the 16-char App Password, not your real Gmail password");
    console.error(" - Remove spaces from the App Password");
    process.exit(1);
  }
})();