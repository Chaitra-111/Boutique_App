import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDesign extends Document {
  name: string;
  modelNumber: string;
  type: "embroidery" | "stitching" | "other";
  customType?: string;
  pattern: string;
  details: string;
  price: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema = new Schema<IDesign>(
  {
    name: { type: String, required: true },
    modelNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["embroidery", "stitching", "other"], required: true, default: "embroidery" },
    customType: { type: String },
    pattern: { type: String, default: "" },
    details: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Design: Model<IDesign> =
  mongoose.models.Design || mongoose.model<IDesign>("Design", DesignSchema);
