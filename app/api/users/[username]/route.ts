import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const clerkUser = await currentUser();

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        city: true,
        age: true,
        level: true,
        xp: true,
        rating: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            friendsInitiated: { where: { status: "accepted" } },
            friendsReceived: { where: { status: "accepted" } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    let friendshipStatus: string | null = null;
    let friendshipId: string | null = null;

    if (clerkUser) {
      const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
      if (me && me.id !== user.id) {
        const friendship = await db.friendship.findFirst({
          where: {
            OR: [
              { requesterId: me.id, addresseeId: user.id },
              { requesterId: user.id, addresseeId: me.id },
            ],
          },
        });
        if (friendship) {
          friendshipStatus = friendship.status;
          friendshipId = friendship.id;
          if (friendship.status === "pending" && friendship.requesterId === user.id) {
            friendshipStatus = "incoming";
          }
        }
      }
    }

    return NextResponse.json({ ...user, friendshipStatus, friendshipId });
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
