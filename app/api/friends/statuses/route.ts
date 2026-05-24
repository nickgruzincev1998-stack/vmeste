import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET /api/friends/statuses?ids=id1,id2,id3
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
    if (ids.length === 0) return NextResponse.json({});

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({});

    const me = await db.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!me) return NextResponse.json({});

    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: me.id, addresseeId: { in: ids } },
          { requesterId: { in: ids }, addresseeId: me.id },
        ],
      },
    });

    const result: Record<string, { status: string | null; friendshipId: string | null }> = {};
    for (const id of ids) {
      const f = friendships.find((fr) => fr.requesterId === id || fr.addresseeId === id);
      if (!f) {
        result[id] = { status: null, friendshipId: null };
      } else if (f.status === "accepted") {
        result[id] = { status: "accepted", friendshipId: f.id };
      } else if (f.status === "pending") {
        result[id] = {
          status: f.requesterId === me.id ? "pending" : "incoming",
          friendshipId: f.id,
        };
      } else {
        result[id] = { status: null, friendshipId: null };
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
