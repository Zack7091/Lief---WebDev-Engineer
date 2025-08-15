import { haversineDistance } from "../utils/haversine";

export const clockIn = async (
  _: any,
  { lat, lng, noteIn }: { lat: number; lng: number; noteIn?: string },
  ctx: any
) => {
  if (!ctx.user || !ctx.user.email) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.prisma.user.findUnique({
    where: { email: ctx.user.email }
  });

  if (!user) {
    throw new Error("User not found in DB");
  }

  const existingLog = await ctx.prisma.clockLog.findFirst({
    where: { userId: user.id, clockOutAt: null }
  });
  if (existingLog) {
    throw new Error("Already clocked in");
  }

  const location = await ctx.prisma.location.findFirst();
  if (!location) {
    throw new Error("No location set");
  }

  const dist = haversineDistance(lat, lng, location.lat, location.lng);
  if (dist > location.radiusKm) {
    throw new Error(`Outside perimeter (${dist} km). Allowed radius ${location.radiusKm} km.`);
  }

  return ctx.prisma.clockLog.create({
    data: {
      userId: user.id,
      clockInAt: Date.now().toString(),
      clockInLoc: location.name,
      noteIn
    },
    include: { user: true }
  });
};
