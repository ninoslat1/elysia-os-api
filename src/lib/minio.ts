import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../env";
import { BadRequestError } from "./error";
import type { S3File } from "bun";
import type { AsssetWriteSession } from "../types/assets";

export const minio = new S3Client({
  endpoint: env.BUCKET_URL,
  region: "us-east-1",
  credentials: {
    accessKeyId: env.BUCKET_USERNAME,
    secretAccessKey: env.BUCKET_PASSWORD,
  },
  forcePathStyle: true, // usually needed for MinIO
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

  // await minio.write(filename, buffer, {
  //   type: file.type,
  // });

  await minio.send(
    new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name ?? "",
      }
    })
  )

  const url = `${env.BUCKET_URL}/${env.BUCKET_NAME}/${filename}`;

  return {
    key: filename,
    url,
  };
};

export const writeFile = async (data: AsssetWriteSession) => {
  if (data.file.size > 50 * 1024 * 1024) {
    throw new BadRequestError("File size exceeds limit (50MB)");
  }

  const extension = data.file.name?.split(".").pop();

  const filename = `assets/${crypto.randomUUID()}.${extension}`;

  const buffer = Buffer.from(await data.file.arrayBuffer());

  // await minio.write(filename, buffer, {
  //   type: file.type,
  // });

   await minio.send(
    new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: data.file.type,
      Metadata: {
        originalName: data.file.name ?? "",
        chunkIndex: data.chunkIndex.toString(),
        nonce: data.nonce,
        sha256: data.sha256
      }
    })
  )

  const url = `${env.BUCKET_URL}/${env.BUCKET_NAME}/${filename}`;

  return {
    key: filename,
    url,
  };
};
