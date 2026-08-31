import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Draft } from "@/models/Draft";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'order' or 'design'
    const phone = searchParams.get("phone") || "boutique_admin";

    await connectDB();
    const query: Record<string, unknown> = { userPhone: phone };
    if (type) query.draftType = type;

    const draft = await Draft.findOne(query).sort({ updatedAt: -1 });
    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("Drafts GET fallback:", err.message);
    return NextResponse.json({ draft: null });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { draftType, data, userPhone = "boutique_admin" } = body;

    if (!draftType || !data) {
      return NextResponse.json({ error: "Draft type and data are required" }, { status: 400 });
    }

    await connectDB();
    const draft = await Draft.findOneAndUpdate(
      { draftType, userPhone },
      { draftType, userPhone, data, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({ draft, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to save draft" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const phone = searchParams.get("phone") || "boutique_admin";

    await connectDB();
    const filter: Record<string, unknown> = { userPhone: phone };
    if (type) filter.draftType = type;
    await Draft.findOneAndDelete(filter);
    return NextResponse.json({ success: true, message: "Draft cleared" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete draft" }, { status: 500 });
  }
}
