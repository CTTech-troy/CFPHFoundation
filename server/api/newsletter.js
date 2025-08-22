// api/newsletter.js
import nodemailer from "nodemailer";

export default async function sendNewsletter(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, html, emails } = req.body;

  if (!subject || !html || !emails || !Array.isArray(emails)) {
    return res.status(400).json({ error: "Missing or invalid fields" });
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
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Newsletter sent!" });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
