import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const [
      friendCount,
      activityCount,
      playedCount,
      reviewCount,
      activities,
      playedActivities,
      reviews,
    ] = await Promise.all([
      db.friendship.count({
        where: {
          status: "accepted",
          OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        },
      }),
      db.activity.count({ where: { creatorId: user.id } }),
      db.participation.count({
        where: { userId: user.id, status: "active" },
      }),
      db.review.count({ where: { revieweeId: user.id } }),
      db.activity.findMany({
        where: { creatorId: user.id },
        orderBy: { date: "desc" },
        take: 9,
        include: {
          category: true,
          _count: { select: { participants: { where: { status: "active" } } } },
        },
      }),
      db.participation.findMany({
        where: { userId: user.id, status: "active" },
        orderBy: { joinedAt: "desc" },
        take: 9,
        include: {
          activity: {
            include: {
              category: true,
              _count: { select: { participants: { where: { status: "active" } } } },
            },
          },
        },
      }),
      db.review.findMany({
        where: { revieweeId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          reviewer: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      }),
    ]);

    let friendshipStatus: string | null = null;
    let friendshipId: string | null = null;

    const clerkUser = await currentUser();
    if (clerkUser) {
      const me = await db.user.findUnique({
        where: { clerkId: clerkUser.id },
        select: { id: true },
      });
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
          friendshipId = friendship.id;
          if (friendship.status === "accepted") {
            friendshipStatus = "accepted";
          } else if (friendship.status === "pending") {
            friendshipStatus =
              friendship.requesterId === me.id ? "pending" : "incoming";
          }
        }
      }
    }

    return NextResponse.json({
      ...user,
      friendCount,
      _count: { activities: activityCount, played: playedCount, reviewsReceived: reviewCount },
      activities,
      playedActivities: playedActivities.map((p) => p.activity),
      reviewsReceived: reviews,
      friendshipStatus,
      friendshipId,
    });
  } catch (error) {
    console.error("[GET /api/users/[username]]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
