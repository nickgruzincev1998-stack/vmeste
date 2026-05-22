import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "activities";

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    if (type === "users") {
      const users = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 20,
      });
      return NextResponse.json(users);
    }

    const activities = await db.activity.findMany({
      where: {
        status: "active",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { placeName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        creator: true,
        _count: { select: { participants: true } },
      },
      take: 20,
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json([]);
  }
}