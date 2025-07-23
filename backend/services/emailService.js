import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Configure transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send shortlist notification email to candidate
 * @param {string} toEmail - Candidate's email address
 * @param {string} jobTitle - Title of the shortlisted job
 * @param {string} jobId - ID of the job
 */
export async function sendShortlistEmail(toEmail, jobTitle, jobId) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `Congratulations! You have been shortlisted for ${jobTitle}`,
    text: `Hello,

Congratulations! You have been shortlisted for the position of ${jobTitle}.
Please log in to your dashboard to view next steps: ${process.env.CLIENT_URL}/jobs/${jobId}

Best regards,
The Recruitment Team`,
    html: `<p>Hello,</p>
           <p>Congratulations! You have been <strong>shortlisted</strong> for the position of <em>${jobTitle}</em>.</p>
           <p>Please <a href="${process.env.CLIENT_URL}/jobs/${jobId}">log in to your dashboard</a> to view next steps.</p>
           <p>Best regards,<br/>The Recruitment Team</p>`,
  };

  await transporter.sendMail(mailOptions);
}
