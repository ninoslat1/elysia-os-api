import { Elysia } from "elysia";
import { jwtPlugin } from "../plugins/jwt";

export const authMiddleware = new Elysia().use(jwtPlugin).derive(async ({ headers, jwt, set }) => {
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

  if (payload.iss !== "SAPKIOSKBE" || payload.aud !== "SAPKIOSKCLIENT") {
    set.status = 403;
    throw new Error("Invalid issuer or audience");
  }

  return {
    user: payload,
  };
});
