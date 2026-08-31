import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const status = searchParams.get("status");

    await connectDB();
    const query: Record<string, unknown> = {};
    if (phone) query.customerPhone = phone;
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("MongoDB fetch error (returning empty array fallback):", err.message);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      designId,
      designModel,
      designName,
      designType,
      designImages,
      measurements,
      baseCost,
      extraCharges = 0,
      paidAmount = 0,
      status = "pending",
      deliveryDate,
      notes,
      orderPhotos = [],
    } = body;

    if (!customerName || !customerPhone || !designModel) {
      return NextResponse.json(
        { error: "Customer name, phone, and design model are required." },
        { status: 400 }
      );
    }

    const numBase = Number(baseCost) || 0;
    const numExtra = Number(extraCharges) || 0;
    const numPaid = Number(paidAmount) || 0;
    const finalCost = numBase + numExtra;
    const balanceAmount = Math.max(0, finalCost - numPaid);

    await connectDB();

    // Upsert customer record
    await Customer.findOneAndUpdate(
      { phone: customerPhone },
      { name: customerName, phone: customerPhone, address: customerAddress || "" },
      { upsert: true, new: true }
    );

    const newOrder = await Order.create({
      customerName,
      customerPhone,
      customerAddress: customerAddress || "",
      designId: designId || undefined,
      designModel,
      designName: designName || "",
      designType: designType || "embroidery",
      designImages: Array.isArray(designImages) ? designImages : [],
      measurements: measurements || {},
      baseCost: numBase,
      extraCharges: numExtra,
      finalCost,
      paidAmount: numPaid,
      balanceAmount,
      status,
      deliveryDate: deliveryDate || "",
      notes: notes || "",
      orderPhotos: Array.isArray(orderPhotos) ? orderPhotos : [],
    });

    return NextResponse.json({ order: newOrder, success: true }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, _id, extraCharges, paidAmount, baseCost, ...rest } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await connectDB();
    const existing = await Order.findById(targetId);
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const newBase = baseCost !== undefined ? Number(baseCost) : existing.baseCost;
    const newExtra = extraCharges !== undefined ? Number(extraCharges) : existing.extraCharges;
    const newPaid = paidAmount !== undefined ? Number(paidAmount) : existing.paidAmount;
    const finalCost = newBase + newExtra;
    const balanceAmount = Math.max(0, finalCost - newPaid);

    const updated = await Order.findByIdAndUpdate(
      targetId,
      {
        ...rest,
        baseCost: newBase,
        extraCharges: newExtra,
        paidAmount: newPaid,
        finalCost,
        balanceAmount,
      },
      { new: true }
    );

    return NextResponse.json({ order: updated, success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    await connectDB();
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete order" }, { status: 500 });
  }
}
