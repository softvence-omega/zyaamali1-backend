// utils/templates/billingReminderTemplate.ts

export const billingReminderTemplate = (
  name: string,
  plan: string,
  amount: number,
  currency: string
) => `
  <div style="font-family: sans-serif;">
    <h2>⏰ Subscription Renewal Reminder</h2>
    <p>Hi ${name || "there"},</p>
    <p>This is a reminder that your <strong>${plan}</strong> subscription will renew tomorrow.</p>
    <p>Amount due: <strong>${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</strong></p>
    <p>No action is required if auto-renew is enabled.</p>
    <br>
    <p>Thank you for using our service!</p>
  </div>
`;
