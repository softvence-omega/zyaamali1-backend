export interface IPricingPlan {
  _id?: string; // Optional for inserts
  name: string;
  usedCase: string;
  price: number;
  stripePriceId?: string;
  billingInterval: 'month' | 'year' | 'day';
  features: IFeatures;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFeatures {
  videoAds: number | 'unlimited';
  videoAdRevisions: number | 'unlimited';
  videoQuality: 'standard' | 'hd';
  imageAds: number | 'unlimited';
  imageAdRevisions: number | 'unlimited';
  aiPrompts: number | 'unlimited';
  teamMembers: number | 'unlimited';
  platforms: string[];
  analytics: 'none' | '7-day' | '30-day' | 'custom';
  templatesAccess: boolean;
  adScheduling: 'none' | 'basic' | 'bulk+smart';
  extras?: string[];
}