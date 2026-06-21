import Elysia, { t } from "elysia";
import { AssetsController } from "../controllers/assets.controller";
import { jwtPlugin } from "../plugins/jwt";
import { env } from "../env";
import type { DashboardToken } from "../types/token";

const controller = new AssetsController();
const FINANCE_ROLE = 3;

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
      response: {
        200: t.Any(),
        404: t.String({
          default: "File not found",
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
  .post(
    "/upload/:locationId",
    async ({ body, set, jwt, headers }) => {
      const token = headers.authorization?.replace("Bearer ", "");

      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;

        return {
          message: "Unauthorized",
        };
      }

      const dashboardToken = payload as DashboardToken;

      if (dashboardToken.subrole === FINANCE_ROLE) {
        set.status = 401;

        return {
          message: "Unauthorized Role",
        };
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
