import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Draft } from "@/models/Draft";
import { memoryDB } from "@/lib/memoryStorage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const phone = searchParams.get("phone") || "boutique_admin";

  try {
    await connectDB();
    const query: Record<string, unknown> = { userPhone: phone };
    if (type) query.draftType = type;

    const draft = await Draft.findOne(query).sort({ updatedAt: -1 });
    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("MongoDB offline, using in-memory drafts:", err.message);
    const found = memoryDB.drafts.find((d) => d.draftType === type);
    return NextResponse.json({ draft: found || null });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { draftType, data, userPhone = "boutique_admin" } = body;

    if (!draftType || !data) {
      return NextResponse.json({ error: "Draft type and data are required" }, { status: 400 });
    }

    try {
      await connectDB();
      const draft = await Draft.findOneAndUpdate(
        { draftType, userPhone },
        { draftType, userPhone, data, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      return NextResponse.json({ draft, success: true });
    } catch (mongoErr: unknown) {
      const idx = memoryDB.drafts.findIndex((d) => d.draftType === draftType);
      const draftObj = { draftType: draftType as "order" | "design", data, updatedAt: new Date().toISOString() };
      if (idx !== -1) {
        memoryDB.drafts[idx] = draftObj;
      } else {
        memoryDB.drafts.push(draftObj);
      }
      return NextResponse.json({ draft: draftObj, success: true });
    }
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

    try {
      await connectDB();
      const filter: Record<string, unknown> = { userPhone: phone };
      if (type) filter.draftType = type;
      await Draft.findOneAndDelete(filter);
    } catch (mongoErr: unknown) {
      memoryDB.drafts = memoryDB.drafts.filter((d) => d.draftType !== type);
    }

    return NextResponse.json({ success: true, message: "Draft cleared" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete draft" }, { status: 500 });
  }
}
