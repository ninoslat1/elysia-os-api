import { S3Client } from "bun";
import { env } from "../env";

export const minio = new S3Client({
  endpoint: env.BUCKET_URL,
  region: "us-east-1",
  accessKeyId: env.BUCKET_USERNAME,
  secretAccessKey: env.BUCKET_PASSWORD,
  bucket: env.BUCKET_NAME,
});

export const BUCKET = env.BUCKET_NAME;
