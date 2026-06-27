import Elysia, { t } from "elysia";
import { AssetsController } from "../controllers/assets.controller";
import { authDisplayMiddleware } from "../middlewares/jwt_middleware";

const controller = new AssetsController();

export const displayAssetsRoute = new Elysia({
  prefix: "/assets",
})
  .use(authDisplayMiddleware)

  .get(
    "/display/:areaId",
    async ({ params, set }) => {
      return await controller.display(params.areaId, set);
    },
    {
      params: t.Object({
        areaId: t.String(),
      }),
      detail: {
        summary: "Fetch display asset (V1)",
        description: "Fetch display asset based on area id parameters",
        tags: ["Asset"],
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      response: {
        200: t.Object({
          url: t.String(),
        }),
        404: t.Object({
          message: t.String({
            default: "Asset not found",
          }),
        }),
      },
    },
  )

  .get(
    "/v2/display/:areaId",
    async ({ params, set }) => {
      return controller.display_v2(params.areaId, set);
    },
    {
      params: t.Object({
        areaId: t.String(),
      }),
      detail: {
        summary: "Fetch display asset (V2)",
        description: "Fetch display asset based on area id parameters",
        tags: ["Asset"],
      },
      response: {
        200: t.Object({
          url: t.String(),
        }),
        404: t.Object({
          message: t.String({
            default: "Asset not found",
          }),
        }),
      },
    },
  )

  .get(
    "/download/:key",
    ({ params, set }) => controller.download(decodeURIComponent(params.key), set),
    {
      params: t.Object({
        key: t.String(),
      }),
      detail: {
        summary: "Download display asset",
        description: "Download display asset by key",
        tags: ["Asset"],
      },
      response: {
        200: t.Any(),
        404: t.String({
          default: "File not found",
        }),
      },
    },
  )

  .onAfterHandle(({ set }) => {
    set.headers["x-content-type-options"] = "nosniff";
    set.headers["x-frame-options"] = "DENY";
    set.headers["referrer-policy"] = "strict-origin-when-cross-origin";
    set.headers["x-xss-protection"] = "0";
  });
