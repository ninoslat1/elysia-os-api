import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../env";

export const jwtDisplayPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: env.JWT_DISPLAY_KEY,
  }),
);

export const jwtDashboardPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: env.JWT_DASHBOARD_KEY,
  }),
);
