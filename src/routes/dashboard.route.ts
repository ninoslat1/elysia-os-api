import Elysia, { t } from "elysia";
import { AssetsController } from "../controllers/assets.controller";
import { dashboardAuthMiddleware } from "../middlewares/jwt_middleware";

const controller = new AssetsController();

const FINANCE_ROLE = 3;

export const dashboardAssetsRoute = new Elysia({
  prefix: "/assets",
})
  .use(dashboardAuthMiddleware)

  .post(
    "/upload",
    async ({ body }) => {
      return await controller.initUploadSession(body);
    },
    {
      body: t.Object({
        fileName: t.Object({
          name: t.String(),
          type: t.String(),
        }),
        totalChunks: t.String(),
      }),
    },
  )
  .post("/upload/:uploadId/chunk/:index", ({ params, request, set }) =>
    controller.uploadChunk(params, request, set),
  )
  .post("/upload/:uploadId/complete", ({ params }) => controller.complete(params))
  .post(
    "/upload/location/:locationId",
    async ({ body, dashboardToken, set }) => {
      if (dashboardToken?.subrole === FINANCE_ROLE) {
        set.status = 401;

        throw new Error("Unauthorized Role");
      }

      return await controller.uploadVideo(body, set);
    },
    {
      body: t.Object({
        file: t.File(),
      }),
      params: t.Object({
        locationId: t.String(),
      }),
      detail: {
        summary: "Upload video asset",
        description: "Upload video asset based on location id parameters",
        tags: ["Asset"],
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    },
  )

  .onAfterHandle(({ set }) => {
    set.headers["x-content-type-options"] = "nosniff";
    set.headers["x-frame-options"] = "DENY";
    set.headers["referrer-policy"] = "strict-origin-when-cross-origin";
    set.headers["x-xss-protection"] = "0";
  });
