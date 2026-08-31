import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { memoryDB } from "@/lib/memoryStorage";
import { OrderData } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const status = searchParams.get("status");

  try {
    await connectDB();
    const query: Record<string, unknown> = {};
    if (phone) query.customerPhone = phone;
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ orders: orders || [] });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("MongoDB offline, using in-memory store for orders:", err.message);
    let filtered = memoryDB.orders;
    if (phone) filtered = filtered.filter((o) => o.customerPhone === phone);
    if (status && status !== "all") filtered = filtered.filter((o) => o.status === status);
    return NextResponse.json({ orders: filtered || [] });
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

    try {
      await connectDB();
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
    } catch (mongoErr: unknown) {
      console.warn("MongoDB offline, storing order in memory");
      const fallbackOrder: OrderData = {
        _id: "ord_" + Date.now(),
        customerName,
        customerPhone,
        customerAddress: customerAddress || "",
        designId,
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
        status: status as OrderData["status"],
        deliveryDate: deliveryDate || "",
        notes: notes || "",
        orderPhotos: Array.isArray(orderPhotos) ? orderPhotos : [],
        createdAt: new Date().toISOString(),
      };

      memoryDB.orders.unshift(fallbackOrder);

      // Customer memory upsert
      const custIdx = memoryDB.customers.findIndex((c) => c.phone === customerPhone);
      if (custIdx !== -1) {
        memoryDB.customers[custIdx].name = customerName;
        memoryDB.customers[custIdx].address = customerAddress || "";
        memoryDB.customers[custIdx].totalOrders += 1;
        memoryDB.customers[custIdx].totalBalance += balanceAmount;
        memoryDB.customers[custIdx].totalBilled += finalCost;
      } else {
        memoryDB.customers.push({
          _id: "cust_" + Date.now(),
          name: customerName,
          phone: customerPhone,
          address: customerAddress || "",
          totalOrders: 1,
          totalBalance: balanceAmount,
          totalBilled: finalCost,
        });
      }

      return NextResponse.json({ order: fallbackOrder, success: true }, { status: 201 });
    }
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

    try {
      await connectDB();
      const existing = await Order.findById(targetId);
      if (existing) {
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
      }
    } catch (mongoErr: unknown) {
      console.warn("MongoDB offline, updating in memory");
      const idx = memoryDB.orders.findIndex((o) => o._id === targetId);
      if (idx !== -1) {
        const o = memoryDB.orders[idx];
        const newBase = baseCost !== undefined ? Number(baseCost) : o.baseCost;
        const newExtra = extraCharges !== undefined ? Number(extraCharges) : o.extraCharges;
        const newPaid = paidAmount !== undefined ? Number(paidAmount) : o.paidAmount;
        const finalCost = newBase + newExtra;
        const balanceAmount = Math.max(0, finalCost - newPaid);
        memoryDB.orders[idx] = {
          ...o,
          ...rest,
          baseCost: newBase,
          extraCharges: newExtra,
          paidAmount: newPaid,
          finalCost,
          balanceAmount,
        };
        return NextResponse.json({ order: memoryDB.orders[idx], success: true });
      }
    }

    return NextResponse.json({ success: true });
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

    try {
      await connectDB();
      await Order.findByIdAndDelete(id);
    } catch (mongoErr: unknown) {
      memoryDB.orders = memoryDB.orders.filter((o) => o._id !== id);
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to delete order" }, { status: 500 });
  }
}
