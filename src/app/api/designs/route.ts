import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Design } from "@/models/Design";
import { INITIAL_DESIGNS } from "@/lib/seedData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    await connectDB();
    const query: Record<string, unknown> = {};
    if (type && type !== "all") {
      query.type = type;
    }

    const designs = await Design.find(query).sort({ createdAt: -1 });
    if (!designs || designs.length === 0) {
      // Return initial designs if database is empty
      const filtered = type && type !== "all" 
        ? INITIAL_DESIGNS.filter(d => d.type === type) 
        : INITIAL_DESIGNS;
      return NextResponse.json({ designs: filtered, isMock: true });
    }

    return NextResponse.json({ designs, isMock: false });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("Falling back to static designs:", err.message);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const filtered = type && type !== "all" 
      ? INITIAL_DESIGNS.filter(d => d.type === type) 
      : INITIAL_DESIGNS;
    return NextResponse.json({ designs: filtered, isMock: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, modelNumber, type, customType, pattern, details, price, images } = body;

    if (!name || !modelNumber) {
      return NextResponse.json({ error: "Name and Model Number are required" }, { status: 400 });
    }

    await connectDB();
    const newDesign = await Design.create({
      name,
      modelNumber: modelNumber.toUpperCase(),
      type: type || "embroidery",
      customType: customType || "",
      pattern: pattern || "",
      details: details || "",
      price: Number(price) || 0,
      images: Array.isArray(images) ? images : [],
    });

    return NextResponse.json({ design: newDesign, success: true }, { status: 201 });
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

    await connectDB();
    const updated = await Design.findByIdAndUpdate(targetId, updateData, { new: true });
    return NextResponse.json({ design: updated, success: true });
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

    await connectDB();
    await Design.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Design deleted" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete design" }, { status: 500 });
  }
}
