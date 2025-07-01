import mongoose from "mongoose";
import { TBusiness } from "./business.interface";

const busineesSchema = new mongoose.Schema<TBusiness>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    goal: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    }

}, { timestamps: true });
export const Business = mongoose.model<TBusiness>("Business", busineesSchema);