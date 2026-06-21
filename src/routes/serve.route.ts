import Elysia, { t } from "elysia";
import { AssetsController } from "../controllers/assets.controller";
import { jwtPlugin } from "../plugins/jwt";
import { env } from "../env";

const controller = new AssetsController();

export const assetsRoute = new Elysia({
  prefix: "/assets",
})
  .use(jwtPlugin)
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
    },
  )
  .get(
    "/v2/display/:areaId",
    async ({ params }) => {
      return controller.display_v2(params.areaId);
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
    "/display/:areaId",
    async ({ params, set, headers, jwt }) => {
      const token = headers.authorization?.replace("Bearer ", "");

      const payload = await jwt.verify(token);

      if (!payload || payload.iss !== env.JWT_ISS || payload.aud !== env.JWT_AUD) {
        set.status = 401;

        return {
          message: "Unauthorized",
        };
      }

      return controller.display(params.areaId);
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
  );
