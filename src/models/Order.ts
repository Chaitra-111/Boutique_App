import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeasurements {
  bust?: string;
  waist?: string;
  hip?: string;
  blouseLength?: string;
  shoulder?: string;
  frontNeck?: string;
  backNeck?: string;
  sleeveLength?: string;
  sleeveRound?: string;
  customNotes?: string;
}

export interface IOrder extends Document {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  designId?: mongoose.Types.ObjectId;
  designModel: string;
  designName: string;
  designType: string;
  designImages: string[];
  measurements: IMeasurements;
  baseCost: number;
  extraCharges: number;
  finalCost: number;
  paidAmount: number;
  balanceAmount: number;
  status: "pending" | "in_progress" | "completed" | "delivered";
  deliveryDate?: string;
  notes?: string;
  orderPhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, default: "" },
    designId: { type: Schema.Types.ObjectId, ref: "Design" },
    designModel: { type: String, required: true },
    designName: { type: String, default: "" },
    designType: { type: String, default: "embroidery" },
    designImages: { type: [String], default: [] },
    measurements: {
      bust: { type: String, default: "" },
      waist: { type: String, default: "" },
      hip: { type: String, default: "" },
      blouseLength: { type: String, default: "" },
      shoulder: { type: String, default: "" },
      frontNeck: { type: String, default: "" },
      backNeck: { type: String, default: "" },
      sleeveLength: { type: String, default: "" },
      sleeveRound: { type: String, default: "" },
      customNotes: { type: String, default: "" },
    },
    baseCost: { type: Number, required: true, default: 0 },
    extraCharges: { type: Number, required: true, default: 0 },
    finalCost: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    balanceAmount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "delivered"],
      default: "pending",
    },
    deliveryDate: { type: String, default: "" },
    notes: { type: String, default: "" },
    orderPhotos: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
