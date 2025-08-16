// src/pages/api/dashboard-data.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

type Json = Record<string, any>;

function hoursBetween(a: Date, b: Date) {
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60));
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Json>) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    // Raw data
    const locations = await prisma.location.findMany();
    const users = await prisma.user.findMany();
    const logsLast7 = await prisma.clockLog.findMany({
      where: { clockInAt: { gte: since } },
      include: { user: true },
      orderBy: { clockInAt: "desc" },
    });
    const openLogs = await prisma.clockLog.findMany({
      where: { clockOutAt: null },
      include: { user: true },
      orderBy: { clockInAt: "desc" },
    });

    // --- Metrics ---
    // 1) Avg hours/day (last 7 days)
    const byDay = new Map<string, number>();
    for (const log of logsLast7) {
      if (!log.clockOutAt) continue; // open shift ko ignore
      const d = new Date(log.clockInAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const prev = byDay.get(key) ?? 0;
      byDay.set(key, prev + hoursBetween(new Date(log.clockInAt), new Date(log.clockOutAt)));
    }
    const totalHours = [...byDay.values()].reduce((a, b) => a + b, 0);
    const avgHoursPerDay = byDay.size ? totalHours / byDay.size : 0;

    // 2) People clocking in per day (avg last 7 days)
    const byDayPeople = new Map<string, Set<string>>();
    for (const log of logsLast7) {
      const d = new Date(log.clockInAt);
      const key = d.toISOString().slice(0, 10);
      if (!byDayPeople.has(key)) byDayPeople.set(key, new Set());
      byDayPeople.get(key)!.add(log.userId);
    }
    const avgPeoplePerDay =
      byDayPeople.size
        ? [...byDayPeople.values()].reduce((a, set) => a + set.size, 0) / byDayPeople.size
        : 0;

    // 3) Currently clocked-in count
    const currentlyClockedIn = openLogs.length;

    // Table: total hours per user — last 7 days
    const hoursByUser = new Map<string, number>();
    const emailByUser = new Map<string, string>();
    const nameByUser = new Map<string, string>();

    for (const log of logsLast7) {
      if (!log.clockOutAt) continue;
      const hrs = hoursBetween(new Date(log.clockInAt), new Date(log.clockOutAt));
      hoursByUser.set(log.userId, (hoursByUser.get(log.userId) ?? 0) + hrs);
      if (log.user) {
        emailByUser.set(log.userId, log.user.email ?? "");
        nameByUser.set(log.userId, log.user.name ?? "");
      }
    }

    const totals = [...hoursByUser.entries()]
      .map(([userId, hours]) => ({
        userId,
        email: emailByUser.get(userId) ?? "",
        name: nameByUser.get(userId) ?? "",
        hours: Number(hours.toFixed(2)),
      }))
      .sort((a, b) => b.hours - a.hours);

    res.status(200).json({
      metrics: {
        avgHoursPerDay: Number(avgHoursPerDay.toFixed(2)),
        avgPeoplePerDay: Number(avgPeoplePerDay.toFixed(2)),
        currentlyClockedIn,
      },
      currentlyClocked: openLogs.map((l) => ({
        id: l.userId,
        email: l.user?.email ?? "",
        name: l.user?.name ?? "",
        since: l.clockInAt,
      })),
      totalsLast7Days: totals,
      raw: {
        locationsCount: locations.length,
        usersCount: users.length,
        logsLast7Count: logsLast7.length,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
