// Simple email stub for development. Replace with real provider (SendGrid, SES, SMTP) in production.
export async function sendEmail({ to, subject, text, html }) {
  console.log(`[email:stub] to=${to} subject="${subject}"`);
  if (text) console.log(text);
  if (html) console.log(html);
  return { ok: true };
}
