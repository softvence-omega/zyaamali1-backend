import { Schema, model } from 'mongoose';
import { AdObjective, AdType, Gender, IAdCampaign, Platform } from './adCampain.interface';

// ← update the path if needed

/* ------------------------------------------------------------------ */
/*                               Schema                               */
/* ------------------------------------------------------------------ */
const AdCampaignSchema = new Schema<IAdCampaign>(
  {
    /* ─────────── Core refs ─────────── */
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    /* ─────────── Basics ─────────── */
    title: { type: String, required: true, trim: true },
    objective: { type: String, enum: Object.values(AdObjective), required: true },
    platform: { type: String, enum: Object.values(Platform), required: true },
    adType: { type: String, enum: Object.values(AdType), required: true },

    /* ─────────── Target audience ─────────── */
    targetAudience: {
      location: { type: String, required: true }, // single location for simplicity
      ageRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
      },
      gender: { type: String, enum: Object.values(Gender), default: Gender.ALL },
      interests: { type: [String], default: [] },
    },

    /* ─────────── Budget & schedule ─────────── */
    budget: {
      daily: { type: Number, required: true },
      total: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },

    /* ─────────── Lifecycle status ─────────── */
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'PENDING', 'INACTIVE'],
      default: 'DRAFT',
    },

    /* ─────────── Performance stats ─────────── */
    stats: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      roas: { type: Number, default: 0 },
    },

    /* ─────────── Ad copy & media ─────────── */
    adCopy: {
      prompt: { type: String },
      generatedText: { type: String },
    },
    
    isDeleted: {
      type: Boolean,
      default: false

    },

    mediaFiles: { type: [String], default: [] },  // direct URLs / IDs
    externalAdId: { type: String },

   

    mediaAssets: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
        isTemplate: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    previewMode: { type: String, enum: ['mobile', 'desktop'], default: 'desktop' },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*                               Model                                */
/* ------------------------------------------------------------------ */
export const adCampainModel = model<IAdCampaign>('AdCampaign', AdCampaignSchema);
