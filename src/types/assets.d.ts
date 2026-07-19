import type { S3File } from "bun";

export interface Asset {
  key: string;
  filename: string;
  size: number;
  lastModified: Date;
  downloadUrl: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface UploadSession {
  uploadId: string;
  key: string;
  locationId: string;
  chunkSize: number;
  totalChunks: number;
  uploadedParts: number[];
  status: "UPLOADING" | "COMPLETED" | "FAILED";
}

export interface AsssetWriteSession {
  file: S3File,
  chunkIndex: number,
  nonce: string
  sha256: string
}
