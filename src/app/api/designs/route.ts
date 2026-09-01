import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Design } from "@/models/Design";
import { memoryDB } from "@/lib/memoryStorage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    await connectDB();
    const query: Record<string, unknown> = {};
    if (type && type !== "all") {
      query.type = type;
    }
    const designs = await Design.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ designs: designs || [] });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("MongoDB offline, using in-memory store for GET:", err.message);
    const filtered = type && type !== "all"
      ? memoryDB.designs.filter((d) => d.type === type)
      : memoryDB.designs;
    return NextResponse.json({ designs: filtered || [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, modelNumber, type, customType, pattern, details, price, images } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Design Name is required" }, { status: 400 });
    }

    // Auto-generate clean model number if not provided by user
    const prefix = type === "stitching" ? "AC-ST" : type === "other" ? "AC-DS" : "AC-EMB";
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const cleanModel = modelNumber && modelNumber.trim()
      ? modelNumber.trim().toUpperCase()
      : `${prefix}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    try {
      await connectDB();

      const newDesign = await Design.create({
        name: name.trim(),
        modelNumber: cleanModel,
        type: type || "embroidery",
        customType: customType || "",
        pattern: pattern || "",
        details: details || "",
        price: Number(price) || 0,
        images: Array.isArray(images) ? images : [],
      });

      return NextResponse.json({ design: newDesign, success: true }, { status: 201 });
    } catch (mongoErr: unknown) {
      const err = mongoErr as Error;
      console.warn("MongoDB offline, saving to memory fallback:", err.message);

      const fallbackDesign = {
        _id: "mem_" + Date.now(),
        id: "mem_" + Date.now(),
        name: name.trim(),
        modelNumber: cleanModel,
        type: type || "embroidery",
        customType: customType || "",
        pattern: pattern || "",
        details: details || "",
        price: Number(price) || 0,
        images: Array.isArray(images) ? images : [],
        createdAt: new Date().toISOString(),
      };

      memoryDB.designs.unshift(fallbackDesign);
      return NextResponse.json({ design: fallbackDesign, success: true }, { status: 201 });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to create design" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, _id, ...updateData } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ error: "Design ID is required for update" }, { status: 400 });
    }

    try {
      await connectDB();
      const updated = await Design.findByIdAndUpdate(targetId, updateData, { new: true });
      return NextResponse.json({ design: updated, success: true });
    } catch (mongoErr: unknown) {
      console.warn("MongoDB offline, updating in memory fallback");
      const idx = memoryDB.designs.findIndex((d) => d._id === targetId || d.id === targetId);
      if (idx !== -1) {
        memoryDB.designs[idx] = { ...memoryDB.designs[idx], ...updateData };
        return NextResponse.json({ design: memoryDB.designs[idx], success: true });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to update design" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    try {
      await connectDB();
      await Design.findByIdAndDelete(id);
    } catch (mongoErr: unknown) {
      console.warn("MongoDB offline, deleting from memory store");
      memoryDB.designs = memoryDB.designs.filter((d) => d._id !== id && d.id !== id);
    }

    return NextResponse.json({ success: true, message: "Design deleted" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete design" }, { status: 500 });
  }
}
