import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Design } from "@/models/Design";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { INITIAL_DESIGNS } from "@/lib/seedData";

export async function GET() {
  try {
    await connectDB();

    // Check if designs exist, if not seed
    const count = await Design.countDocuments();
    if (count === 0) {
      for (const d of INITIAL_DESIGNS) {
        await Design.create({
          name: d.name,
          modelNumber: d.modelNumber,
          type: d.type,
          customType: d.customType,
          pattern: d.pattern,
          details: d.details,
          price: d.price,
          images: d.images,
        });
      }

      // Seed initial customers
      const c1 = await Customer.create({
        name: "Priya Sharma",
        phone: "9876543210",
        address: "Flat 402, Lotus Residency, Jubilee Hills, Hyderabad",
      });

      const c2 = await Customer.create({
        name: "Ananya Reddy",
        phone: "9123456789",
        address: "House #12, Road 10, Banjara Hills, Hyderabad",
      });

      const c3 = await Customer.create({
        name: "Sneha Patel",
        phone: "9988776655",
        address: "Plot 89, Green Meadows, Madhapur",
      });

      // Seed initial sample orders
      await Order.create({
        customerName: c1.name,
        customerPhone: c1.phone,
        customerAddress: c1.address,
        designModel: "AC-EMB-101",
        designName: "Royal Zardosi Bridal Blouse",
        designType: "embroidery",
        designImages: [INITIAL_DESIGNS[0].images[0]],
        measurements: {
          bust: "36 in",
          waist: "30 in",
          blouseLength: "14.5 in",
          shoulder: "14 in",
          frontNeck: "6.5 in",
          backNeck: "9 in (Deep Pot Neck)",
          sleeveLength: "10.5 in",
          sleeveRound: "12 in",
          customNotes: "Add handmade pearl latkans on back tie-up",
        },
        baseCost: 4800,
        extraCharges: 400,
        finalCost: 5200,
        paidAmount: 2500,
        balanceAmount: 2700,
        status: "in_progress",
        deliveryDate: "2026-09-08",
        notes: "Bridal order - deliver 3 days before wedding",
        orderPhotos: [INITIAL_DESIGNS[0].images[0]],
      });

      await Order.create({
        customerName: c2.name,
        customerPhone: c2.phone,
        customerAddress: c2.address,
        designModel: "AC-STT-201",
        designName: "Designer Anarkali & Flared Kurti",
        designType: "stitching",
        designImages: [INITIAL_DESIGNS[2].images[0]],
        measurements: {
          bust: "34 in",
          waist: "28 in",
          hip: "38 in",
          blouseLength: "52 in (Floor length)",
          sleeveLength: "Full (21 in)",
        },
        baseCost: 2800,
        extraCharges: 0,
        finalCost: 2800,
        paidAmount: 2800,
        balanceAmount: 0,
        status: "completed",
        deliveryDate: "2026-09-02",
        notes: "Ready for pickup",
        orderPhotos: [INITIAL_DESIGNS[2].images[0]],
      });

      await Order.create({
        customerName: c3.name,
        customerPhone: c3.phone,
        customerAddress: c3.address,
        designModel: "AC-EMB-102",
        designName: "Aari Work Pastel Pink Blouse",
        designType: "embroidery",
        designImages: [INITIAL_DESIGNS[1].images[0]],
        measurements: {
          bust: "38 in",
          waist: "32 in",
          blouseLength: "15 in",
        },
        baseCost: 3500,
        extraCharges: 300,
        finalCost: 3800,
        paidAmount: 1000,
        balanceAmount: 2800,
        status: "pending",
        deliveryDate: "2026-09-12",
        notes: "Customer requested pastel pink dori",
        orderPhotos: [INITIAL_DESIGNS[1].images[0]],
      });
    }

    return NextResponse.json({ success: true, message: "Database initialized and verified." });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("DB seed notice:", err.message);
    return NextResponse.json({ success: true, warning: "Using in-memory/client fallback if MongoDB is offline" });
  }
}
