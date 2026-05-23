import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "No address" }, { status: 400 });

  const key = process.env.YANDEX_GEOCODER_KEY;
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&geocode=${encodeURIComponent(address)}&format=json&results=1`;

  const res = await fetch(url);
  const data = await res.json();

  const members = data?.response?.GeoObjectCollection?.featureMember;
  if (!members || members.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pos = members[0].GeoObject.Point.pos as string;
  const [lng, lat] = pos.split(" ").map(Number);
  return NextResponse.json({ lat, lng });
}