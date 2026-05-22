import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    const messages = await db.message.findMany({
      where: { activityId },
      include: { sender: true },
      orderBy: { sentAt: "asc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) {
      return NextResponse.json({ error: "Не найден" }, { status: 404 });
    }

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: user.id,
        activityId,
        content: content.trim(),
      },
      include: { sender: true },
    });

    // Отправляем через Pusher
    await pusherServer.trigger(
      `activity-${activityId}`,
      "new-message",
      {
        id: message.id,
        content: message.content,
        sentAt: message.sentAt,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
        },
      }
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}