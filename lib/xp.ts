import { db } from "@/lib/db";

// XP thresholds per level
export const LEVEL_THRESHOLDS = [
  { level: 1, name: "Салага",       emoji: "🐣", min: 0,    max: 299  },
  { level: 2, name: "Активист",     emoji: "🏃", min: 300,  max: 899  },
  { level: 3, name: "Гроза района", emoji: "⚡", min: 900,  max: 2399 },
  { level: 4, name: "Легенда",      emoji: "🔥", min: 2400, max: 5399 },
  { level: 5, name: "Чемпион",      emoji: "👑", min: 5400, max: Infinity },
];

export const XP_REWARDS = {
  JOIN_ACTIVITY:     10,
  COMPLETE_ACTIVITY: 50,
  CREATE_ACTIVITY:   30,
  FIVE_STAR_REVIEW:  25,
  NEW_CATEGORY:      20,
  REFER_FRIEND:     100,
} as const;

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) return LEVEL_THRESHOLDS[i].level;
  }
  return 1;
}

export function getLevelInfo(xp: number) {
  const level = getLevelFromXP(xp);
  const cur  = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
  const isMax = cur.max === Infinity;
  const progress = isMax ? 100 : Math.min(((xp - cur.min) / (cur.max - cur.min + 1)) * 100, 100);
  const xpLeft   = isMax ? 0 : cur.max - xp + 1;
  return { level, cur, next, progress, xpLeft, isMax };
}

export async function grantXP(userId: string, amount: number): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { xp: true } });
  if (!user) return;
  const newXP = Math.max(0, (user.xp ?? 0) + amount);
  const newLevel = getLevelFromXP(newXP);
  await db.user.update({ where: { id: userId }, data: { xp: newXP, level: newLevel } });
}
