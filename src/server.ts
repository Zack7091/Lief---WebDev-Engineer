import { ApolloServer, gql } from "apollo-server-micro";
import { resolvers } from "./resolvers";
import { context } from "./context";

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

export default server;
