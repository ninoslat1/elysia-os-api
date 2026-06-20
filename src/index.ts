import cors from "@elysiajs/cors";
import { Elysia } from "elysia";

import { connectNodeAdapter } from "@connectrpc/connect-node";

import minioGrpcRoute from "./grpc/minio";
import { assetsRoute } from "./routes/serve.route";
import { env } from "./env";

const handler = connectNodeAdapter({
  routes(router) {
    minioGrpcRoute(router);
  },
});

const app = new Elysia()
  .use(cors())
  .use(assetsRoute)
  .get("/", () => ({
    message: "Object storage API running",
  }))

  .listen(env.APP_PORT);

console.log(
  `🦊 Server running at http://localhost:${app.server?.port}`
);

Bun.serve({
  port: env.GRPC_PORT,

  fetch(req) {
    return new Promise((resolve) => {
      handler(req as any, {
        end(body: any) {
          resolve(
            new Response(body)
          );
        },
      } as any);
    });
  },
});

console.log(
  `🚀 gRPC running at http://localhost:${env.GRPC_PORT}`
);