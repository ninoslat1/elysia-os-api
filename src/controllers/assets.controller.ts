import { BadRequestError, NotFoundError } from "../lib/error";
import { writeFile, writeVideoFile } from "../lib/minio";
import { AssetsService } from "../services/assets.service";

export class AssetsController {
  constructor(private readonly assetsService = new AssetsService()) {}

  async download(key: string, set: any) {
    try {
      const result = await this.assetsService.getDownloadFile(key);

      if (!result) {
        throw new NotFoundError("File not found");
      }

      const filename = key.split("/").pop() ?? "file";
      const contentType = result.stat.type ?? "application/octet-stream";

      return new Response(result.file.stream(), {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        set.status = 404;
        return { message: error.message };
      }

      console.error("[AssetsController][download]", error);

      set.status = 500;
      return { message: "Internal server error" };
    }
  }

  async display(uid: string, set: any) {
    try {
      const result = await this.assetsService.getDisplayAsset(uid);

      if (!result) {
        throw new NotFoundError("Asset not found");
      }

      return new Response(result.file.stream(), {
        headers: {
          "Content-Type": "video/mp4",
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        set.status = 404;
        return { message: error.message };
      }

      console.error("[AssetsController][display]", error);

      set.status = 500;
      return { message: "Internal server error" };
    }
  }

  async display_v2(uid: string, set: any) {
    try {
      const result = await this.assetsService.getDisplayAssetV2(uid);

      if (!result) {
        throw new NotFoundError("Asset not found");
      }

      return {
        url: result.url,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        set.status = 404;
        return { message: error.message };
      }

      console.error("[AssetsController][display_v2]", error);

      set.status = 500;
      return { message: "Internal server error" };
    }
  }

  async uploadVideo(body: any, set: any) {
    try {
      const file = body.file;

      if (!file) {
        throw new BadRequestError("File is required");
      }

      const result = await writeVideoFile(file);

      return {
        message: "Upload success",
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        set.status = 400;
        return { message: error.message };
      }

      console.error("[AssetsController][uploadVideo]", error);

      set.status = 500;
      return { message: "Internal server error" };
    }
  }

  async upload(body: any, set: any) {
    try {
      const file = body.file;

      if (!file) {
        throw new BadRequestError("File is required");
      }

      const result = await writeFile(file);

      return {
        message: "Upload success",
        data: result,
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        set.status = 400;
        return { message: error.message };
      }

      console.error("[AssetsController][upload]", error);

      set.status = 500;
      return { message: "Internal server error" };
    }
  }

  async initUploadSession(body: any) {
    const result = await this.assetsService.initUpload(body.fileName, body.totalChunks);

    return result;
  }

  async uploadChunk(params: any, request: Request, set: any) {
    try {
      const stream = request.body;

      if (!stream) {
        set.status = 404;

        return {
          message: "No Body Stream",
        };
      }

      const buffer = Buffer.from(await new Response(stream).arrayBuffer());

      await this.assetsService.uploadChunk(params.uploadId, params.index, buffer);

      return { message: "Chunk uploaded" };
    } catch (error) {
      set.status = 500;
      return { message: error instanceof Error ? error.message : "Upload chunk failed" };
    }
  }

  async complete(params: any) {
    const result = await this.assetsService.completeUpload(params.uploadId);

    return result;
  }
}
