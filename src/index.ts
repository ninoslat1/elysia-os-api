import cors from "@elysia/cors";
import { Elysia } from "elysia";
import { assetsRoute } from "./routes/serve";

const app = new Elysia()
  .use(cors())
  .use(assetsRoute)
  .get("/", () => ({ message: "Flaplock API running" }))
  .listen(3000);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
