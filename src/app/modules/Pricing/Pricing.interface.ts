export interface IPricing {
    name: string;
  usedCase: string;
  price: number;
  dailyCredits: number;
  totalCredits: number;
  Storage: number;
  isDelete?: boolean;
}