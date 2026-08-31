import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
  customerName: string;
  customerPhone: string;
  designId?: mongoose.Types.ObjectId;
  designModel: string;
  designName: string;
  message?: string;
  status: "new" | "contacted" | "converted";
  createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    designId: { type: Schema.Types.ObjectId, ref: "Design" },
    designModel: { type: String, required: true },
    designName: { type: String, default: "" },
    message: { type: String, default: "Interested in this design" },
    status: { type: String, enum: ["new", "contacted", "converted"], default: "new" },
  },
  { timestamps: true }
);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
