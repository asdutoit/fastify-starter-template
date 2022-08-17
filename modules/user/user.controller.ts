import { FastifyReply, FastifyRequest } from "fastify";
import {
  createUser,
  findUserByEmail,
  verifyPassword,
  findUsers,
} from "./user.service";
import { OAuth2Client } from "google-auth-library";
import oauthPlugin from "@fastify/oauth2";
import { CreateUserInput, LoginInput } from "./user.schema";
import { server } from "../../src/app";

async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  try {
    const user = await createUser(body);
    reply.status(201).send(user);
  } catch (error) {
    reply.status(500).send({
      message: error,
    });
  }
}

async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply
) {
  const body = request.body;

  // find user by email
  const user = await findUserByEmail(body.email);
  if (!user) {
    reply.status(401).send({
      message: "Invalid email or password",
    });
  }

  // verify password
  const correctPassword = await verifyPassword(body.password, user.password);
  if (!correctPassword) {
    reply.status(401).send({
      message: "Invalid email or password",
    });
  }
  const { password, salt, ...rest } = user;
  // generate access token
  // return access token
  return { accessToken: server.jwt.sign(rest) };
}

async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
  const users = await findUsers();

  return users;
}

async function googleAuthHandler(
  this: any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
    request
  );
  console.log("TOKEN", token.token);
  reply.send({ access_token: token.token });
}

export {
  registerUserHandler,
  loginHandler,
  getUsersHandler,
  googleAuthHandler,
};
