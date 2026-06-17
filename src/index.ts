import cors from "@elysia/cors";
import { Elysia } from "elysia";
import { assetsRoute } from "./routes/serve.route";
import { env } from "./env";

const app = new Elysia()
  .use(cors())
  .use(assetsRoute)
  .get("/", () => ({ message: "Object storage API running" }))
  .listen(env.APP_PORT);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
