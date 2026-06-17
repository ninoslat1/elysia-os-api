import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../env";

export const jwtPlugin = new Elysia().use(
  jwt({
    name: "jwt",
    secret: env.JWT_DISPLAY_KEY,
  }),
);
