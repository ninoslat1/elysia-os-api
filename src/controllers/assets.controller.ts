import { AssetsService } from "../services/assets.service";

export class AssetsController {
  constructor(private readonly assetsService = new AssetsService()) {}

  async download(key: string, set: any) {
    const result = await this.assetsService.getDownloadFile(key);

    if (!result) {
      set.status = 404;
      return {
        message: "File not found",
      };
    }

    const filename = key.split("/").pop() ?? "file";

    set.headers["Content-Type"] = result.stat.type ?? "application/octet-stream";

    set.headers["Content-Disposition"] = `attachment; filename="${filename}"`;

    return result.file.stream();
  }

  async display(uid: string) {
    const result = await this.assetsService.getDisplayAsset(uid);

    if (!result) {
      return new Response(
        JSON.stringify({
          message: "Asset not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(result.file.stream(), {
      headers: {
        "Content-Type": "video/mp4",
      },
    });
  }

  async display_v2(uid: string) {
    const result = await this.assetsService.getDisplayAssetV2(uid);

    if (!result) {
      return new Response(
        JSON.stringify({
          message: "Asset not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return Response.json({
      url: result.url,
    });
  }
}
