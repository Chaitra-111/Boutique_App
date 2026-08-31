import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDraft extends Document {
  draftType: "order" | "design";
  userPhone: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const DraftSchema = new Schema<IDraft>(
  {
    draftType: { type: String, enum: ["order", "design"], required: true },
    userPhone: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Draft: Model<IDraft> =
  mongoose.models.Draft || mongoose.model<IDraft>("Draft", DraftSchema);
