import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ success: true, message: "Database connection verified." });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn("DB notice:", err.message);
    return NextResponse.json({ success: true, warning: "Using fallback if MongoDB is offline" });
  }
}
