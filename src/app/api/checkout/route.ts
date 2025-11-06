import { createCheckoutSession } from "@/actions/actions";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const url = await createCheckoutSession();
    if (!url) {
      return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
    return Response.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}