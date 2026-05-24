import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) return NextResponse.json([]);

    const clerkUser = await currentUser();
    const me = clerkUser
      ? await db.user.findUnique({ where: { clerkId: clerkUser.id } })
      : null;

    const users = await db.user.findMany({
      where: {
        AND: [
          me ? { id: { not: me.id } } : {},
          {
            OR: [
              { name:     { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: { id: true, username: true, name: true, avatar: true, city: true },
      take: 10,
    });

    if (!me) return NextResponse.json(users.map((u) => ({ ...u, friendshipStatus: null, friendshipId: null })));

    const ids = users.map((u) => u.id);
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: me.id, addresseeId: { in: ids } },
          { requesterId: { in: ids }, addresseeId: me.id },
        ],
      },
    });

    const result = users.map((u) => {
      const f = friendships.find(
        (fr) => fr.requesterId === u.id || fr.addresseeId === u.id
      );
      let friendshipStatus: string | null = null;
      let friendshipId: string | null = null;
      if (f) {
        friendshipId = f.id;
        if (f.status === "accepted") friendshipStatus = "accepted";
        else if (f.status === "pending") {
          friendshipStatus = f.requesterId === me.id ? "pending" : "incoming";
        }
      }
      return { ...u, friendshipStatus, friendshipId };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
