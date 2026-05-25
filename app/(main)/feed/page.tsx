import { db } from "@/lib/db";
import FeedClient from "@/components/feed/FeedClient";

export default async function FeedPage() {
  let categories: { id: string; nameRu: string; icon: string }[] = [];
  try {
    categories = await db.category.findMany({ orderBy: { nameRu: "asc" } });
  } catch {
    // if DB is unreachable the client will still render (categories just won't show)
  }

  return <FeedClient categories={categories} />;
}
