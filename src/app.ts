import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fjwt from "@fastify/jwt";
import fastifyEnv from "@fastify/env";
import userRoutes from "../modules/user/user.route";
import productRoutes from "../modules/product/product.route";
import { userSchemas } from "../modules/user/user.schema";
import { productSchemas } from "../modules/product/product.schema";
import swagger from "@fastify/swagger";
import S from "fluent-json-schema";
const oauthPlugin = require("@fastify/oauth2");
import { version } from "../package.json";

let environment = process.env.NODE_ENV || "development";

const envSchema = S.object()
  .prop("NODE_ENV", S.string())
  .prop("SECRET", S.string().required())
  .prop("DATABASE_URL", S.string().required());

const options = {
  schema: envSchema,
  dotenv: true,
};

export const server = Fastify({
  logger: {
    transport:
      environment === "development"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
              colorize: true,
              // singleLine: true,
            },
          }
        : undefined,
  },
});

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      email: string;
      name: string;
      id: number;
    };
  }
}

server.register(fastifyEnv, options);
server.register(fjwt, { secret: process.env.SECRET });
server.register(oauthPlugin, {
  name: "googleOAuth2",
  scope: ["profile", "email"],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: "/login/google",
  callbackUri: "http://localhost:3000/api/users/login/google/callback",
});

server.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply): Promise<any> => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.send(error);
    }
  }
);

server.get("/healthcheck", async function (request, response) {
  request.log.info("healthcheck");
  return { status: "OK" };
});

async function main() {
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }

  server.register(swagger, {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "Fastify API",
        description: "Testing the Fastify swagger API",
        version,
      },
      host: "localhost:3000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
        },
      },
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });

  server.register(userRoutes, { prefix: "/api/users" });
  server.register(productRoutes, { prefix: "/api/products" });

  try {
    await server.listen({ port: 3000 });
    console.log(`server listening on http://localhost:3000}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
