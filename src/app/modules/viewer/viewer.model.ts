// viewer.model.ts
import { Schema, model } from "mongoose";
import { TViewer } from "./viewer.interface";

const viewerSchema = new Schema<TViewer>(
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

        role: {
            type: String,
            required: true,
            default: "viewer",
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

export const Viewer = model<TViewer>("Viewer", viewerSchema);
