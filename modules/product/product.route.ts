import { FastifyInstance } from "fastify";
import { createProductHandler, getProductsHandler } from "./product.controller";
import { $ref } from "./product.schema";

async function ProductRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        body: $ref("createProductSchema"),
        response: {
          201: $ref("productResponseSchema"),
        },
        security: [{ apiKey: [] }],
      },
    },
    createProductHandler
  );
  server.get(
    "/getproducts",
    {
      preHandler: [server.authenticate],
      schema: {
        security: [{ apiKey: [] }],
      },
    },
    getProductsHandler
  );
}

export default ProductRoutes;
