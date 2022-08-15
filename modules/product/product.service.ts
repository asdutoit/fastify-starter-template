import { CreateProductInput } from "./product.schema";
import prisma from "../../src/utils/prisma";

export async function createProduct(
  data: CreateProductInput & { ownerId: number }
) {
  return await prisma.product.create({ data });
}

export async function getProducts() {
  return await prisma.product.findMany({
    select: {
      title: true,
      content: true,
      price: true,
      id: true,
      createdAt: true,
      owner: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });
}
