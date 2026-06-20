import Elysia, { t } from "elysia";
import { minio } from "../lib/minio";

export const assetsRoute = new Elysia({ prefix: "/assets" })
  .get(
    "/download/:key",
    async ({ params, set }) => {
      const key = decodeURIComponent(params.key);
      const file = minio.file(key);

      if (!(await file.exists())) {
        set.status = 404;
        return { message: "File not found" };
      }

      const stat = await file.stat();
      const filename = key.split("/").pop() ?? "file";

      set.headers["Content-Type"] = stat.type ?? "application/octet-stream";
      set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;

      return file.stream();
    },
    {
      params: t.Object({ key: t.String() }),
    },
  )
  .get(
    "/releases/latest",
    async ({ query, set }) => {
      const { folder, filename } = query;

      const key = folder ? `${folder}/${filename}` : filename;
      const file = minio.file(key);

      if (!(await file.exists())) {
        set.status = 404;
        return { message: "File not found" };
      }

      const stat = await file.stat();

      return {
        key,
        filename,
        size: stat.size,
        contentType: stat.type,
        downloadUrl: `/assets/download/${encodeURIComponent(key)}`,
      };
    },
    {
      query: t.Object({
        filename: t.String(),
        folder: t.Optional(t.String()),
      }),
    },
  );
