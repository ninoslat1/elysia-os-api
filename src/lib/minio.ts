import { S3Client, type S3File } from "bun";
import { env } from "../env";
import { BadRequestError } from "./error";

export const minio = new S3Client({
  endpoint: env.BUCKET_URL,
  region: "us-east-1",
  accessKeyId: env.BUCKET_USERNAME,
  secretAccessKey: env.BUCKET_PASSWORD,
  bucket: env.BUCKET_NAME,
});

export const BUCKET = env.BUCKET_NAME;

export const writeVideoFile = async (file: S3File) => {
  if (file.size > 50 * 1024 * 1024) {
    throw new BadRequestError("File size exceeds limit (50MB)");
  }

  if (!file.type.startsWith("video/")) {
    throw new BadRequestError("Invalid file type");
  }

  const extension = file.name?.split(".").pop() || "mp4";

  const filename = `videos/${crypto.randomUUID()}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await minio.write(filename, buffer, {
    type: file.type,
  });

  const url = `${env.BUCKET_URL}/${env.BUCKET_NAME}/${filename}`;

  return {
    key: filename,
    url,
  };
};
