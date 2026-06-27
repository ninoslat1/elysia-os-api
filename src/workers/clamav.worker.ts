import { scanBuffer } from "../lib/clamav";
import { minio } from "../lib/minio";
import { redisClient } from "../lib/redis";

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

async function worker() {
  while (true) {
    try {
      const result = await redisClient.brpop("queue:scan", 0);

      if (!result) continue;

      const [, job] = result;

      const payload = JSON.parse(job);

      const file = minio.file(payload.key);

      if (!(await file.exists())) {
        console.error("File not found");
        continue;
      }

      const buffer = await streamToBuffer(file.stream());

      const clean = await scanBuffer(buffer);

      if (!clean) {
        console.error("[INFECTED]", payload.key);

        continue;
      }

      console.log("[CLEAN]", payload.key);

      // move to production bucket
    } catch (error) {
      console.error(error);
    }
  }
}

worker();
