// viewer.model.ts
import { Schema, model } from "mongoose";
import { TCreator } from "./creator.interface";

const creatorSchema = new Schema<TCreator>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },



        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        role: {
            type: String,
            required: true,
            default: "creator",
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Creator = model<TCreator>("Creator", creatorSchema);
