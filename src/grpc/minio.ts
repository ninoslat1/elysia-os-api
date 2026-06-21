import { Code, ConnectError, type ConnectRouter } from "@connectrpc/connect";
import { MinioService } from "../protogen/minio_pb";
import { AssetsService } from "../services/assets.service";

const assetsService = new AssetsService();

export default function minioGrpcRoute(router: ConnectRouter) {
  router.service(MinioService, {
    async getAreaAssetUrl(req) {
      const result = await assetsService.getDisplayAssetV2(req.areaUid);

      if (!result) {
        throw new ConnectError("Asset not found", Code.NotFound);
      }

      return {
        url: result.url,
      };
    },
  });
}
