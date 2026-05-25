import type { Metadata } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://vmeste-tau.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        category: true,
        creator: { select: { name: true } },
        _count: { select: { participants: { where: { status: "active" } } } },
      },
    });

    if (!activity) return {};

    const spotsLeft = activity.maxParticipants - activity._count.participants;
    const date = activity.date.toLocaleDateString("ru-RU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const ogImageUrl = `${SITE_URL}/api/activities/${id}/share`;
    const pageUrl    = `${SITE_URL}/activities/${id}`;

    const description = [
      `${activity.category.icon} ${activity.category.nameRu}`,
      activity.placeName,
      date,
      spotsLeft > 0 ? `${spotsLeft} мест` : "Мест нет",
    ].join(" · ");

    return {
      title: `${activity.title} — вместе`,
      description,
      openGraph: {
        title: `${activity.category.icon} ${activity.title}`,
        description,
        url: pageUrl,
        siteName: "вместе",
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: activity.title }],
        type: "website",
        locale: "ru_RU",
      },
      twitter: {
        card: "summary_large_image",
        title: activity.title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {};
  }
}

export default function ActivityDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
