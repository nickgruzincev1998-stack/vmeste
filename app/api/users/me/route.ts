import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { name, city, bio, age } = body;

    const user = await db.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        ...(name && { name }),
        ...(city !== undefined && { city }),
        ...(bio !== undefined && { bio }),
        ...(age !== undefined && { age: Number(age) }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}