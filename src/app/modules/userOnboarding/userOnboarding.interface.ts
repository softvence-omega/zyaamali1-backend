interface OnboardingData {
  userId: string;
  brandName: string;
  marketingGoals: string[];
  businessInfo: {
    method: "website" | "other";
    websiteUrl: string;
    businessName: string;
    industry: string;
    businessSize: string;
    description: string;
    buniessGoal : string
  };
}
