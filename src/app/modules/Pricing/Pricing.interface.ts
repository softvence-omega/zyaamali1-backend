export interface IPricing {
  name: string;
  usedCase: string;
  price: number;
  totalCredits: number;
  stripePriceId?: string; // Stripe price ID for recurring payments
  isDeleted?: boolean;
}
