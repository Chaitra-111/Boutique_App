import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { memoryDB } from "@/lib/memoryStorage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const customers = await Customer.find().sort({ updatedAt: -1 }).lean();
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
    return NextResponse.json({ customers: memoryDB.customers || [] });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const phone = searchParams.get("phone");

    if (!id && !phone) {
      return NextResponse.json({ error: "Customer ID or Phone required" }, { status: 400 });
    }

    try {
      await connectDB();
      if (id) await Customer.findByIdAndDelete(id);
      else if (phone) await Customer.findOneAndDelete({ phone });
    } catch (mongoErr: unknown) {
      memoryDB.customers = memoryDB.customers.filter((c) => c._id !== id && c.phone !== phone);
    }

    return NextResponse.json({ success: true, message: "Customer removed" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete customer" }, { status: 500 });
  }
}
