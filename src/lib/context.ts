// src/lib/context.ts
import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

export type AppContext = {
  prisma: typeof prisma;
  user?: { email?: string; sub?: string } | null;
};

export async function createContext({ req }: { req: NextApiRequest }): Promise<AppContext> {
  const auth = req.headers.authorization;
  if (!auth) {
    return { prisma, user: null };
  }
  const token = auth.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as any;
    return { prisma, user: { email: payload.email, sub: payload.sub } };
  } catch (err) {
    // Invalid token -> no user in context (GraphQL resolvers can throw if needed)
    return { prisma, user: null };
  }
}
