import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../env";

export const minio = new S3Client({
  endpoint: "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: env.BUCKET_USERNAME,
    secretAccessKey: env.BUCKET_PASSWORD,
  },
  forcePathStyle: true,
});

export const BUCKET = env.BUCKET_NAME;