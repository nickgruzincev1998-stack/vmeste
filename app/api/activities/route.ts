import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}