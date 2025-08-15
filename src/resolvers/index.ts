import { clockIn } from "./clockIn";
import { clockOut } from "./clockOut";

export const resolvers = {
  Mutation: {
    clockIn,
    clockOut
  }
};
