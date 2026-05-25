import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Node.js runtime — can use Prisma
export const runtime = "nodejs";

const SITE_URL = "https://vmeste-tau.vercel.app";

function getLevelInfo(xp: number): string {
  if (xp < 300)  return "Салага 🐣";
  if (xp < 900)  return "Активист 🏃";
  if (xp < 2400) return "Гроза района ⚡";
  if (xp < 5400) return "Легенда 🔥";
  return "Чемпион 👑";
}

function fmtDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function spotsText(n: number): string {
  if (n <= 0) return "Мест нет";
  const mod10  = n % 10;
  const mod100 = n % 100;
  const verb = (mod10 === 1 && mod100 !== 11) ? "Нужен" : "Нужны";
  const noun =
    (mod100 >= 11 && mod100 <= 19) ? "игроков" :
    mod10 === 1 ? "игрок" :
    (mod10 >= 2 && mod10 <= 4) ? "игрока" :
    "игроков";
  return `${verb} ${n} ${noun} — присоединяйся!`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        category: true,
        creator: { select: { name: true, xp: true } },
        _count: { select: { participants: { where: { status: "active" } } } },
      },
    });

    if (!activity) {
      return new Response("Not found", { status: 404 });
    }

    const spotsLeft = activity.maxParticipants - activity._count.participants;
    const pageUrl   = `${SITE_URL}/activities/${id}`;
    const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(pageUrl)}&color=4ade80&bgcolor=0d1a0d&margin=8&format=png`;

    const titleFontSize = activity.title.length > 35 ? 36 : activity.title.length > 22 ? 44 : 52;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "#0a0f0a",
            display: "flex",
            flexDirection: "column",
            padding: "52px 64px 44px",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* ── Glow blobs ── */}
          <div
            style={{
              position: "absolute", top: "-180px", left: "-180px",
              width: "680px", height: "680px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(74,222,128,0.13) 0%, transparent 70%)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute", bottom: "-120px", right: "220px",
              width: "460px", height: "460px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(45,90,61,0.28) 0%, transparent 70%)",
              display: "flex",
            }}
          />

          {/* ── Logo ── */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
            <span style={{ color: "#fff", fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px" }}>
              вме
            </span>
            <span style={{ color: "#4ade80", fontSize: "22px", fontWeight: 900 }}>сте</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", marginLeft: "12px", fontWeight: 400 }}>
              · поиск компании
            </span>
          </div>

          {/* ── Main row ── */}
          <div style={{ display: "flex", flex: 1, gap: "44px", alignItems: "center" }}>

            {/* Emoji box */}
            <div
              style={{
                width: "158px", height: "158px", borderRadius: "28px",
                background: "rgba(45,90,61,0.40)",
                border: "1.5px solid rgba(74,222,128,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "88px", flexShrink: 0,
              }}
            >
              {activity.category.icon}
            </div>

            {/* Text block */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              {/* Category label */}
              <div
                style={{
                  color: "#4ade80", fontSize: "13px", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.13em", marginBottom: "10px",
                }}
              >
                {activity.category.nameRu}
              </div>

              {/* Title */}
              <div
                style={{
                  color: "#fff", fontSize: `${titleFontSize}px`,
                  fontWeight: 900, lineHeight: 1.04, marginBottom: "22px",
                  wordBreak: "break-word",
                }}
              >
                {activity.title}
              </div>

              {/* Meta */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "26px" }}>
                <div style={{ color: "rgba(255,255,255,0.48)", fontSize: "18px", display: "flex", gap: "8px" }}>
                  <span>📍</span><span>{activity.placeName}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.48)", fontSize: "18px", display: "flex", gap: "8px" }}>
                  <span>🗓</span><span>{fmtDate(activity.date)}</span>
                </div>
              </div>

              {/* Spots badge */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: spotsLeft > 0 ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1.5px solid ${spotsLeft > 0 ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}`,
                  borderRadius: "999px", padding: "10px 22px", width: "fit-content",
                  color: spotsLeft > 0 ? "#4ade80" : "#f87171",
                  fontSize: "17px", fontWeight: 700,
                }}
              >
                <span>👥</span>
                <span>{spotsText(spotsLeft)}</span>
              </div>
            </div>

            {/* QR code */}
            <div
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "8px", flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: "#0d1a0d",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: "16px", padding: "10px", display: "flex",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} width={120} height={120} alt="QR" />
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", textAlign: "center" }}>
                сканируй → вступай
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: "28px", paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{ color: "rgba(255,255,255,0.32)", fontSize: "14px", display: "flex", gap: "6px" }}
            >
              <span>Организатор:</span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{activity.creator.name}</span>
              <span>·</span>
              <span>{getLevelInfo(activity.creator.xp)}</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.22)", fontSize: "13px" }}>
              vmeste-tau.vercel.app
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("[share/og]", err);
    return new Response("Error generating image", { status: 500 });
  }
}
