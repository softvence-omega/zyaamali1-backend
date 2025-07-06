import { z } from 'zod';

// Enums
export const AdObjectiveEnum = z.enum(['Brand Awareness', 'Lead Generation', 'Sales', 'Engagement']);
export const PlatformEnum = z.enum(['facebook', 'google', 'linkedin', 'twitter', 'tiktok', 'youtube']);
export const AdTypeEnum = z.enum([
  'Image Ads', 'Slideshow Ads', 'Video Ads',
  'Interactive Ads', 'Text Ads', 'Story Ads',
  'Carousel Ads', 'Dynamic Ads', 'Shopping Ads'
]);
export const GenderEnum = z.enum(['ALL', 'Male', 'Female']);
export const PreviewModeEnum = z.enum(['mobile', 'desktop']);

export const adCampainPostValidation = z.object({
  body: z.object({
    business: z.string({ required_error: "Business ID is required" }),
    createdBy: z.string({ required_error: "CreatedBy user ID is required" }),

    title: z.string().min(1, { message: "Ad title is required" }),
    objective: z.string(),
    platform: z.string(),
    adType: z.string(),

    targetAudience: z.object({
      location: z.string().min(1, { message: "Location is required" }),
      ageRange: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
      }),
      gender: GenderEnum.optional(),
      interests: z.array(z.string()).optional(),
    }),

    budget: z.object({
      daily: z.number().min(1),
      total: z.number().min(1),
      startDate: z.string().min(1), // Can use z.coerce.date() if date parsing is required
      endDate: z.string().min(1),
    }),

    adCopy: z.object({
      prompt: z.string().optional(),
      generatedText: z.string().optional(),
    }).optional(),

    mediaFiles: z.array(z.string()).optional(),

    mediaAssets: z.array(z.object({
      url: z.string().url(),
      type: z.enum(['image', 'video']),
      isTemplate: z.boolean().optional(),
      createdAt: z.string().optional(), // Optional ISO string
    })).optional(),

    previewMode: PreviewModeEnum.optional(),
  })
});

export const adCampainUpdateValidation = adCampainPostValidation.partial();