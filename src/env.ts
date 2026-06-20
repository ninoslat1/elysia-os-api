import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    BUCKET_NAME: z.string().min(1),
    BUCKET_USERNAME: z.string().min(1),
    BUCKET_PASSWORD: z.string().min(1),
    BUCKET_URL: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASS: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_MST: z.string().min(1),
    JWT_DISPLAY_KEY: z.string().min(1),
    JWT_ISS: z.string().min(1),
    JWT_AUD: z.string().min(1),
    APP_PORT: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {},

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
