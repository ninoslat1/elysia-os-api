import cors from "@elysiajs/cors";
import { Elysia, t } from "elysia";

import { connectNodeAdapter } from "@connectrpc/connect-node";

import minioGrpcRoute from "./grpc/minio";
import { env } from "./env";
import openapi from "@elysia/openapi";
import { displayAssetsRoute } from "./routes/display.route";
import { dashboardAssetsRoute } from "./routes/dashboard.route";

const handler = connectNodeAdapter({
  routes(router) {
    minioGrpcRoute(router);
  },
});

const app = new Elysia()
  .onAfterHandle(({ set }) => {
    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  })
  .use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    }),
  )
  .use(
    openapi({
      documentation: {
        info: {
          title: "MinIO Gateway API",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    }),
  )
  .use(displayAssetsRoute)
  .use(dashboardAssetsRoute)
  .get(
    "/",
    () => ({
      message: "Object storage API running",
    }),
    {
      detail: {
        summary: "Check health",
        description: "Check health in root route",
        tags: ["Health"],
      },
      response: {
        200: t.Object({
          message: t.String({
            default: "Object storage API running",
          }),
        }),
      },
    },
  )
  .listen(env.APP_PORT);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);

Bun.serve({
  port: env.GRPC_PORT,

  fetch(req) {
    return new Promise((resolve) => {
      handler(
        req as any,
        {
          end(body: any) {
            resolve(new Response(body));
          },
        } as any,
      );
    });
  },
});

console.log(`🚀 gRPC running at http://localhost:${env.GRPC_PORT}`);
