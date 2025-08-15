// src/pages/api/graphql.ts
import { ApolloServer, gql } from "apollo-server-micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma"; // Adjust path if needed

export const config = {
  api: {
    bodyParser: false,
  },
};

// --- Haversine helper (km) ---
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- GraphQL schema ---
const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: String!
    clockLogs: [ClockLog!]!
  }

  type Location {
    id: ID!
    name: String!
    lat: Float!
    lng: Float!
    radiusKm: Float!
    createdAt: String
    updatedAt: String
  }

  type ClockLog {
    id: ID!
    userId: String!
    clockInAt: String
    clockInLoc: String
    clockOutAt: String
    clockOutLoc: String
    noteIn: String
    noteOut: String
    user: User!
  }

  type UserHours {
    userId: String!
    totalHours: Float!
  }

  type DayCount {
    date: String!
    count: Int!
  }

  type DashboardStats {
    avgHoursPerDay: Float!
    avgPeoplePerDay: Float!
    peoplePerDayByDate: [DayCount!]!
    totalHoursLast7DaysPerUser: [UserHours!]!
  }

  type Query {
    hello: String
    users: [User!]!
    clockLogs: [ClockLog!]!
    getLocations: [Location!]!
    getClockedInStaff: [ClockLog!]!
    dashboardStats: DashboardStats!
  }

  type Mutation {
    createUser(email: String!, name: String, role: String!): User!
    createLocation(name: String!, lat: Float!, lng: Float!, radiusKm: Float!): Location!
    clockIn(userId: String!, lat: Float!, lng: Float!, noteIn: String): ClockLog!
    clockOut(userId: String!, lat: Float, lng: Float, noteOut: String): ClockLog!
  }
`;

// --- Resolvers ---
const resolvers = {
  Query: {
    hello: () => "API is working 🚀",

    users: () =>
      prisma.user.findMany({
        include: { clockLogs: true },
      }),

    clockLogs: () =>
      prisma.clockLog.findMany({
        include: { user: true },
        orderBy: { clockInAt: "desc" },
      }),

    getLocations: async () => {
      const locs = await prisma.location.findMany({ orderBy: { createdAt: "desc" } });
      return locs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      }));
    },

    // ✅ Updated getClockedInStaff
    getClockedInStaff: async () => {
      const logs = await prisma.clockLog.findMany({
        where: { clockOutAt: null },
        include: { user: true },
        orderBy: { clockInAt: "desc" },
      });
      return logs.map((l) => ({
        ...l,
        clockInAt: l.clockInAt?.toISOString(),
      }));
    },

    // ✅ Updated dashboardStats
    dashboardStats: async () => {
      const now = new Date();
      const periodStart = new Date();
      periodStart.setHours(0, 0, 0, 0);
      periodStart.setDate(periodStart.getDate() - 6);
      const periodEnd = new Date();
      periodEnd.setHours(23, 59, 59, 999);

      const logs = await prisma.clockLog.findMany({
        where: {
          AND: [
            { clockInAt: { lte: periodEnd } },
            {
              OR: [
                { clockOutAt: { gte: periodStart } },
                { clockOutAt: null },
              ],
            },
          ],
        },
      });

      const perUserHours = new Map<string, number>();
      let totalHours = 0;
      const dailySets: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());

      for (const l of logs) {
        const start = l.clockInAt;
        const end = l.clockOutAt ?? now;

        const overlapStart = start > periodStart ? start : periodStart;
        const overlapEnd = end < periodEnd ? end : periodEnd;

        if (overlapEnd > overlapStart) {
          const hours = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);
          totalHours += hours;
          perUserHours.set(l.userId, (perUserHours.get(l.userId) || 0) + hours);

          for (let i = 0; i < 7; i++) {
            const dayStart = new Date(periodStart);
            dayStart.setDate(periodStart.getDate() + i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const dayOverlapStart = start > dayStart ? start : dayStart;
            const dayOverlapEnd = end < dayEnd ? end : dayEnd;
            if (dayOverlapEnd > dayOverlapStart) {
              dailySets[i].add(l.userId);
            }
          }
        }
      }

      const dailyCounts = dailySets.map((s, idx) => ({
        date: new Date(periodStart.getTime() + idx * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        count: s.size,
      }));

      const sumDailyCounts = dailyCounts.reduce((sum, d) => sum + d.count, 0);
      const avgPeoplePerDay = Number((sumDailyCounts / 7).toFixed(2));
      const avgHoursPerDay = Number((totalHours / 7).toFixed(2));

      const totalHoursLast7DaysPerUser = Array.from(perUserHours.entries()).map(([userId, hrs]) => ({
        userId,
        totalHours: Number(hrs.toFixed(2)),
      }));

      return {
        avgHoursPerDay,
        avgPeoplePerDay,
        peoplePerDayByDate: dailyCounts,
        totalHoursLast7DaysPerUser,
      };
    },
  },

  Mutation: {
    createUser: async (_: any, { email, name, role }: any) => {
      const u = await prisma.user.create({
        data: { email, name: name || null, role },
        include: { clockLogs: true },
      });
      return u;
    },

    createLocation: async (_: any, { name, lat, lng, radiusKm }: any) => {
      const loc = await prisma.location.create({
        data: { name, lat, lng, radiusKm },
      });
      return {
        ...loc,
        createdAt: loc.createdAt.toISOString(),
        updatedAt: loc.updatedAt.toISOString(),
      };
    },

    clockIn: async (_: any, { userId, lat, lng, noteIn }: any) => {
      const loc = await prisma.location.findFirst({ orderBy: { createdAt: "asc" } });
      if (!loc) throw new Error("No location configured.");

      const distKm = haversineKm(lat, lng, loc.lat, loc.lng);
      if (distKm > loc.radiusKm) throw new Error(`Outside perimeter (${distKm.toFixed(2)} km).`);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found.");

      const open = await prisma.clockLog.findFirst({ where: { userId, clockOutAt: null } });
      if (open) throw new Error("Already clocked in.");

      const log = await prisma.clockLog.create({
        data: {
          userId,
          clockInAt: new Date(),
          clockInLoc: `${lat},${lng}`,
          noteIn: noteIn || null,
        },
        include: { user: true },
      });

      return {
        ...log,
        clockInAt: log.clockInAt?.toISOString(),
        clockOutAt: log.clockOutAt?.toISOString?.() ?? null,
      };
    },

    clockOut: async (_: any, { userId, lat, lng, noteOut }: any) => {
      const open = await prisma.clockLog.findFirst({
        where: { userId, clockOutAt: null },
        orderBy: { clockInAt: "desc" },
      });
      if (!open) throw new Error("No active clock-in found.");

      const clockOutLoc = lat != null && lng != null ? `${lat},${lng}` : "manual";

      const updated = await prisma.clockLog.update({
        where: { id: open.id },
        data: {
          clockOutAt: new Date(),
          clockOutLoc,
          noteOut: noteOut || null,
        },
        include: { user: true },
      });

      return {
        ...updated,
        clockInAt: updated.clockInAt?.toISOString(),
        clockOutAt: updated.clockOutAt?.toISOString(),
      };
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers } as any);

let apolloHandler: any;
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!apolloHandler) {
    await apolloServer.start();
    apolloHandler = apolloServer.createHandler({ path: "/api/graphql" });
  }
  return apolloHandler(req, res);
}
