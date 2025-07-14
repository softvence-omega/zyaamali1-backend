import { Types } from 'mongoose';

export enum AdObjective {
  BRAND_AWARENESS = 'BRAND_AWARENESS',
  LEAD_GENERATION = 'LEAD_GENERATION',
  SALES = 'SALES',
  ENGAGEMENT = 'ENGAGEMENT',
}

export enum Platform {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE',
  INSTAGRAM = 'INSTAGRAM',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  TIKTOK = 'TIKTOK',
  YOUTUBE = 'YOUTUBE',
}

export enum AdType {
  IMAGE = 'IMAGE_ADS',
  INTERACTIVE = 'INTERACTIVE_ADS',
  CAROUSEL = 'CAROUSEL_ADS',
  SLIDESHOW = 'SLIDESHOW_ADS',
  TEXT = 'TEXT_ADS',
  DYNAMIC = 'DYNAMIC_ADS',
  VIDEO = 'VIDEO_ADS',
  STORY = 'STORY_ADS',
  SHOPPING = 'SHOPPING_ADS',
}

export enum Gender {
  ALL = 'ALL',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface IAdCampaign {
  business: Types.ObjectId;
  createdBy: Types.ObjectId;
  isDeleted?: boolean;
  title: string;
  objective: AdObjective;
  platform: Platform;
  adType: AdType;

  targetAudience: {
    location: string;
    ageRange: {
      min: number;
      max: number;
    };
    gender: Gender;
    interests: string[];
  };

  budget: {
    daily: number;
    total: number;
    startDate: Date;
    endDate: Date;
    costPerClick: number
  };

  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'PENDING' | 'INACTIVE';

  stats: {
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
    reach: number;
    revenue:number

  };

  adCopy?: {
    prompt?: string;
    generatedText?: string;
  };

  mediaFiles?: string[]; // Direct URLs or file IDs
  externalAdId?: string;


  mediaAssets?: {
    url: string;
    type: 'image' | 'video';
    isTemplate?: boolean;
    createdAt?: Date;
  }[];

  previewMode?: 'mobile' | 'desktop';

  createdAt?: Date;
  updatedAt?: Date;
}
