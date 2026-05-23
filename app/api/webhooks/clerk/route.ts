import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }

    const payload = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let event: any;
    try {
      event = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { type, data } = event;

    if (type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses[0]?.email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim() || "Пользователь";
      const username = email.split("@")[0] + Math.floor(Math.random() * 1000);

      await db.user.create({
        data: {
          clerkId: id,
          email,
          name,
          username,
          avatar: image_url,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}