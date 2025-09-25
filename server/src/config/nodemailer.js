import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";
// console.log(process.env.MAIL_USER, process.env.MAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Optional: verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Mail server connection error:", error);
  } else {
    console.log("Mail server is ready to send messages ✔️");
  }
});

export default transporter;
