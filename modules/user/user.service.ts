import prisma from "../../src/utils/prisma";
import { CreateUserInput } from "./user.schema";
import bcrypt from "bcrypt";

export async function createUser(input: CreateUserInput) {
  const { password, ...rest } = input;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      ...rest,
      salt,
      password: hashedPassword,
    },
  });

  return user;
}

// export async function getUser(id: string) {
//   const user = await prisma.user.findOne({
//     where: {
//       id,
//     },
//   });

//   return user;
// }

export async function verifyPassword(candidatePassword: string, hash: string) {
  const match = await bcrypt.compare(candidatePassword, hash);
  return match;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUsers() {
  return prisma.user.findMany({
    select: {
      email: true,
      name: true,
      id: true,
    },
  });
}
