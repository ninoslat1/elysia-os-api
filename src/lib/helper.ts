import type { Asset } from "../types/assets";
import { minio } from "./minio";

export const listAllObjects = async (): Promise<Asset[]> => {
  const items: Asset[] = [];
  let startAfter: string | undefined;

  do {
    const result = await minio.list({ maxKeys: 1000, startAfter });

    for (const obj of result.contents ?? []) {
      if (!obj.key) continue;
      items.push(toAsset(obj.key, obj.size, obj.lastModified));
    }

    if (!result.isTruncated) break;
    startAfter = result.contents?.at(-1)?.key;
  // oxlint-disable-next-line no-constant-condition
  } while (true);

  return items;
};

export const toAsset = (key: string, size?: number, lastModified?: string): Asset => ({
  key,
  filename: key.split("/").pop() ?? key,
  size: size ?? 0,
  lastModified: lastModified ? new Date(lastModified) : new Date(),
  downloadUrl: `/assets/download/${encodeURIComponent(key)}`,
});

export const filterBySearch = (items: Asset[], search: string): Asset[] => {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter((item) => item.key.toLowerCase().includes(q));
};

export const paginate = <T>(
  items: T[],
  page: number,
  limit: number,
): { items: T[]; total: number; totalPages: number } => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return {
    items: items.slice(offset, offset + limit),
    total,
    totalPages,
  };
};
