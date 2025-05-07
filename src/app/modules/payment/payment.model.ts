import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }  
);

export const paymentModel = mongoose.model("payment", paymentSchema);

// models/Payment.model.ts

interface IPaymentItem {
  product: mongoose.Types.ObjectId; // ref to Product
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface IPaymentInfo {
  id: string; // Stripe PaymentIntent ID
  status: string;
  paymentMethod: string; // e.g. card
}

interface IPayment extends Document {
  user: mongoose.Types.ObjectId; // ref to User
  items: IPaymentItem[];
  paymentInfo: IPaymentInfo;
  totalAmount: number;
  PaymentStatus: "Processing" | "success" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentItemSchema = new Schema<IPaymentItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [PaymentItemSchema],

    paymentInfo: {
      id: { type: String, required: true }, // Stripe payment_intent ID
      status: { type: String, required: true },
      paymentMethod: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    PaymentStatus: {
      type: String,
      enum: ["Processing", "success", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
