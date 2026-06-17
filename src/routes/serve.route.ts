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

      return controller.display(params.areaId, set);
    },
    {
      params: t.Object({
        areaId: t.String(),
      }),
    },
  );
