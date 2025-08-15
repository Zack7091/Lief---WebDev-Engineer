import { haversineDistance } from "../utils/haversine";

export const clockOut = async (
  _: any,
  args: { lat: number; lng: number; noteOut: string },
  ctx: any
) => {
  const { lat, lng, noteOut } = args;
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
  if (!existingLog) {
    throw new Error("No active clock-in found");
  }

  const location = await ctx.prisma.location.findFirst();
  if (!location) {
    throw new Error("No location set");
  }

  const dist = haversineDistance(lat, lng, location.lat, location.lng);
  if (dist > location.radiusKm) {
    throw new Error(`Outside perimeter (${dist} km). Allowed radius ${location.radiusKm} km.`);
  }

  return ctx.prisma.clockLog.update({
    where: { id: existingLog.id },
    data: {
      clockOutAt: Date.now().toString(),
      clockOutLoc: location.name,
      noteOut
    },
    include: { user: true }
  });
};
