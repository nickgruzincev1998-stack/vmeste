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
            friendsReceived:  { where: { status: "accepted" } },
            reviewsReceived:  true,
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            title: true,
            date: true,
            placeName: true,
            difficulty: true,
            maxParticipants: true,
            status: true,
            category: { select: { id: true, name: true, nameRu: true, icon: true, slug: true } },
            _count: { select: { participants: { where: { status: "active" } } } },
          },
        },
        reviewsReceived: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: { select: { id: true, username: true, name: true, avatar: true } },
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

    const friendCount =
      (user._count.friendsInitiated ?? 0) + (user._count.friendsReceived ?? 0);

    return NextResponse.json({
      ...user,
      friendCount,
      friendshipStatus,
      friendshipId,
    });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
