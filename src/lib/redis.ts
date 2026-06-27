import { RedisClient } from "bun";
import { env } from "../env";

export const redisClient = new RedisClient(
  `redis://:${env.REDIS_PASS}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
);
