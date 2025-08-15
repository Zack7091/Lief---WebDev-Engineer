import { getSession } from "@auth0/nextjs-auth0";
import { prisma } from "./lib/prisma";

import { NextApiRequest } from "next";

export const context = async ({ req }: { req: NextApiRequest }) => {
  const session = getSession(req);
  return {
    prisma,
    user: session?.user || null
  };
};
