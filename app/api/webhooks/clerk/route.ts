import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

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
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}