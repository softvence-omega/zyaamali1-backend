// utils/templates/paymentSuccessTemplate.ts

export const paymentSuccessTemplate = (
    name: string,
    plan: string,
    amount: number,
    currency: string,
    interval: string
) => `
  <div style="font-family: sans-serif;">
    <h2>🎉 Payment Received</h2>
<p style="font-size: 16px; line-height: 1.6;">
  Hi ${name || "there"},
</p>
<p style="font-size: 16px; line-height: 1.6;">
  We're happy to confirm that your payment of 
  <strong>${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</strong> 
  has been successfully received.
</p>
<p style="font-size: 16px; line-height: 1.6;">
  Your <strong>${plan}</strong> Plan is now active for one <strong>${interval}</strong>.
</p>
<p style="font-size: 16px; line-height: 1.6;">
  Thank you for choosing us! 🚀
</p>

    <br>
    <p>We appreciate your support!</p>
  </div>
`;
