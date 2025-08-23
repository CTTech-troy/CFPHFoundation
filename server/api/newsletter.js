// api/newsletter.js
import nodemailer from "nodemailer";

export default async function sendNewsletter(req, res) {
  if (req.method !== "POST") {
    console.warn(`Method Not Allowed: ${req.method} on ${req.url}`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, html, emails } = req.body;

  if (!subject || !html || !emails || !Array.isArray(emails)) {
    console.warn("Invalid request body:", req.body);
    return res.status(400).json({ error: "Missing or invalid fields", received: req.body });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Newsletter" <${process.env.SMTP_USER}>`,
    to: emails.join(","),
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Newsletter sent:", info);
    res.status(200).json({ success: true, message: "Newsletter sent!", info });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({ success: false, error: "Failed to send newsletter", details: error.message });
  }
}
