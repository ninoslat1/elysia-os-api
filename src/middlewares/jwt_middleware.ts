import { Elysia } from "elysia";
import { jwtDashboardPlugin, jwtDisplayPlugin } from "../plugins/jwt";
import { env } from "../env";
import type { DashboardToken } from "../types/token";

export const authDisplayMiddleware = new Elysia()
  .use(jwtDisplayPlugin)
  .decorate("user", null as any)
  .resolve(async ({ headers, jwt, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");

    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      throw new Error("Invalid token");
    }

    if (payload.iss !== env.JWT_ISS || payload.aud !== env.JWT_ISS) {
      set.status = 403;
      throw new Error("Invalid issuer or audience");
    }

    return {
      user: payload,
    };
  });

export const dashboardAuthMiddleware = new Elysia()
  .use(jwtDashboardPlugin)
  .decorate("dashboardToken", null as DashboardToken | null)
  .resolve(async ({ headers, dashboard_jwt, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");

    const payload = await dashboard_jwt.verify(token);

    if (!payload) {
      set.status = 401;
      throw new Error("Invalid token");
    }

    const dashboardToken = payload as DashboardToken;

    if (dashboardToken.customerId != null) {
      throw new Error("Unauthorized Token Source");
    }

    return {
      dashboardToken,
    };
  });
