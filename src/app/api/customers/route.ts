import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { memoryDB } from "@/lib/memoryStorage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view"); // 'recycle' or 'active'

  try {
    await connectDB();

    const customerQuery: Record<string, unknown> = {};
    if (view === "recycle") {
      customerQuery.isDeleted = true;
    } else {
      customerQuery.isDeleted = { $ne: true };
    }

    const customers = await Customer.find(customerQuery).sort({ updatedAt: -1 }).lean();
    const orders = await Order.find().lean();

    const customerSummary = customers.map((c) => {
      const customerOrders = orders.filter(
        (o) => o.customerPhone === c.phone || (o.customerName && o.customerName.toLowerCase() === c.name.toLowerCase())
      );
      const totalOrders = customerOrders.length;
      const totalBalance = customerOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
      const totalBilled = customerOrders.reduce((sum, o) => sum + (o.finalCost || 0), 0);

      return {
        _id: c._id,
        name: c.name,
        phone: c.phone,
        address: c.address || "",
        isDeleted: c.isDeleted,
        totalOrders,
        totalBalance,
        totalBilled,
        recentOrders: customerOrders.slice(0, 3),
      };
    });

    return NextResponse.json({ customers: customerSummary });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("MongoDB offline, serving customers from memory store:", err.message);
    let filtered = memoryDB.customers;
    if (view === "recycle") {
      filtered = filtered.filter((c) => c.isDeleted);
    } else {
      filtered = filtered.filter((c) => !c.isDeleted);
    }
    return NextResponse.json({ customers: filtered || [] });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, _id, ...updateData } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ error: "Customer ID required" }, { status: 400 });
    }

    try {
      await connectDB();
      const updated = await Customer.findByIdAndUpdate(targetId, updateData, { new: true });
      return NextResponse.json({ customer: updated, success: true });
    } catch (mongoErr: unknown) {
      const idx = memoryDB.customers.findIndex((c) => c._id === targetId);
      if (idx !== -1) {
        memoryDB.customers[idx] = { ...memoryDB.customers[idx], ...updateData };
        return NextResponse.json({ customer: memoryDB.customers[idx], success: true });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");
    const permanent = searchParams.get("permanent") === "true";

    if (!id && !phone) {
      return NextResponse.json({ error: "Customer ID or Phone required" }, { status: 400 });
    }

    try {
      await connectDB();
      if (permanent) {
        if (id) await Customer.findByIdAndDelete(id);
        else if (phone) await Customer.findOneAndDelete({ phone });
      } else {
        // Soft delete: move to recycle bin
        if (id) await Customer.findByIdAndUpdate(id, { isDeleted: true });
        else if (phone) await Customer.findOneAndUpdate({ phone }, { isDeleted: true });
      }
    } catch (mongoErr: unknown) {
      if (permanent) {
        memoryDB.customers = memoryDB.customers.filter((c) => c._id !== id && c.phone !== phone);
      } else {
        const idx = memoryDB.customers.findIndex((c) => c._id === id || c.phone === phone);
        if (idx !== -1) memoryDB.customers[idx].isDeleted = true;
      }
    }

    return NextResponse.json({ success: true, message: permanent ? "Customer permanently deleted" : "Customer moved to Recycle Bin" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete customer" }, { status: 500 });
  }
}
