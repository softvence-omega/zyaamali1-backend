import mongoose from "mongoose";
    
    const reportsSchema = new mongoose.Schema({
    
     isDelete: {
            type: Boolean,
            default: false,
        }}, { timestamps: true });
    
    export const reportsModel = mongoose.model("reports", reportsSchema);