import mongoose from "mongoose";

const configureSchema = new mongoose.Schema({
    dollerPerToken: {
        type: Number,
        required: true,
        min: 0,
    },
    dailyTokenLimit: {
        type: Number,
        required: true,
        min: 0,
    },
    models: {
        type: Map,
        of: new mongoose.Schema({
            inputToken: {
                type: Number,
                min: 0,
            },
            outputToken: {
                type: Number,
                min: 0
            },
        }),

        default: {}
    }

}, { timestamps: true });

export const configureModel = mongoose.model("configure", configureSchema);