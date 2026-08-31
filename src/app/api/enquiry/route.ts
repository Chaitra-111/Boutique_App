import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";

export async function GET() {
  try {
    await connectDB();
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return NextResponse.json({ enquiries });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("Enquiries GET fallback:", err.message);
    return NextResponse.json({ enquiries: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, designId, designModel, designName, message } = body;

    if (!customerName || !customerPhone || !designModel) {
      return NextResponse.json({ error: "Name, phone and design model are required" }, { status: 400 });
    }

    await connectDB();
    const enquiry = await Enquiry.create({
      customerName,
      customerPhone,
      designId: designId || undefined,
      designModel,
      designName: designName || "",
      message: message || "Interested in this design",
    });

    return NextResponse.json({ enquiry, success: true }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to submit enquiry" }, { status: 500 });
  }
}
