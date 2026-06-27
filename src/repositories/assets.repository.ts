import { redisClient } from "../lib/redis";

export class AssetsRepository {
  constructor() {}

  async createSession(id: string, data: any) {
    await redisClient.set(`upload:${id}`, JSON.stringify(data));
  }

  async getSession(id: string) {
    const data = await redisClient.get(`upload:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async updateSession(id: string, data: any) {
    await redisClient.set(`upload:${id}`, JSON.stringify(data));
  }

  async pushScanQueue(key: string) {
    await redisClient.lpush("queue:scan", key);
  }
}
