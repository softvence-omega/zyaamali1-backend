export interface IPricing {
  name: string;
  usedCase: string;
  price: number;
  totalCredits: number;
  stripePriceId?: string; // Stripe price ID for recurring payments
  billingInterval: "month" | "year" | "day"; // Billing interval for the plan
  isDeleted?: boolean;
}
