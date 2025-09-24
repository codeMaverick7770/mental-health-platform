import transporter from "../config/nodemailer.js";

export const sendOtpEmail = async (userEmail, otp) => {
  try {
    const mailOptions = {
      from: `"Mental Health Platform" <${process.env.MAIL_USER}>`,
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2>One-Time Password (OTP)</h2>
          <p>We received a request that requires verification with an OTP.</p>
          <p style="text-align: center; font-size: 20px; letter-spacing: 3px; font-weight: bold;">
            ${otp}
          </p>
          <p>This code is valid for <b>5 minutes</b>.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr/>
          <p style="font-size: 12px; color: #666;">
            Mental Health Platform Security Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error(`OTP email could not be sent: ${error.message}`);
  }
};
