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
  console.log("[ClamAV Worker] started");

  while (true) {
    try {
      console.log("[ClamAV Worker] waiting for jobs...");

      const result = await redisClient.brpop("queue:scan", 0);

      if (!result) continue;

      const [, job] = result;

      const payload = JSON.parse(job);

      console.log("[ClamAV Worker] scanning:", payload.key);

      const file = minio.file(payload.key);

      if (!(await file.exists())) {
        console.error("[ClamAV Worker] file not found:", payload.key);

        continue;
      }

      const buffer = await streamToBuffer(file.stream());

      console.log("[ClamAV Worker] file loaded:", {
        key: payload.key,
        size: buffer.length,
      });

      const clean = await scanBuffer(buffer);

      if (!clean) {
        console.error("[INFECTED]", payload.key);

        // optional:
        // delete infected file
        // await file.delete();

        continue;
      }

      console.log("[CLEAN]", payload.key);

      // optional:
      // update DB status
      // move bucket
      // notify frontend
    } catch (error) {
      console.error("[ClamAV Worker] error:", error);
    }
  }
}

await worker();
