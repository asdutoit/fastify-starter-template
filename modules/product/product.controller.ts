import { CreateProductInput } from "./product.schema";
import { FastifyRequest, FastifyReply } from "fastify";
import { createProduct, getProducts } from "./product.service";

export async function createProductHandler(
  request: FastifyRequest<{
    Body: CreateProductInput;
  }>,
  reply: FastifyReply
) {
  const product = await createProduct({
    ...request.body,
    ownerId: request.user.id,
  });
  return product;
}

export async function getProductsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const products = await getProducts();
  return products;
}
