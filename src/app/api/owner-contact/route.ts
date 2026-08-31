import { NextResponse } from "next/server";
import { memoryDB } from "@/lib/memoryStorage";

declare global {
  // eslint-disable-next-line no-var
  var boutiqueOwnerContact: { name: string; phone: string } | undefined;
}

if (!global.boutiqueOwnerContact) {
  global.boutiqueOwnerContact = { name: "Aruna", phone: "9876543210" };
}

export async function GET() {
  return NextResponse.json({
    owner: global.boutiqueOwnerContact,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone } = body;
    if (phone) {
      global.boutiqueOwnerContact = {
        name: name || "Aruna",
        phone: phone.trim(),
      };
    }
    return NextResponse.json({ success: true, owner: global.boutiqueOwnerContact });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
