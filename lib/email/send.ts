// Email send stub. Replace with a real provider (Resend, Postmark, etc.)
// when ready. For now, logs the message so confirmation links are visible
// during local development.

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  console.log("[email:stub]", JSON.stringify(message, null, 2));
}
