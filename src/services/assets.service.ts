import { minio } from "../lib/minio";
import { AreaRepository } from "../repositories/area.repository";
import { LocationRepository } from "../repositories/location.repository";
import { NotFoundError } from "../lib/error";
import { env } from "../env";
import { AssetsRepository } from "../repositories/assets.repository";

export class AssetsService {
  constructor(
    private readonly areaRepository = new AreaRepository(),
    private readonly locationRepository = new LocationRepository(),
    private readonly assetRepository = new AssetsRepository(),
  ) {}

  async getDisplayAsset(uid: string) {
    let key: string;
    const areaId = await this.areaRepository.findAreaLocationIDByUid({ uid });

    if (!areaId) {
      throw new NotFoundError("Area not found");
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      throw new NotFoundError("Lokasi not found");
    }

    key = location.videoUrl ? location.videoUrl : "spiout.mp4";

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        throw new NotFoundError("Assets not found");
      }

      return {
        key,
        file,
        stat: await file.stat(),
      };
    } catch (error) {
      console.error("[AssetService] [getDisplayAsset]", error);
      throw error;
    }
  }

  async getDisplayAssetV2(uid: string) {
    let key: string;
    const areaId = await this.areaRepository.findAreaLocationIDByUid({ uid });

    if (!areaId) {
      throw new NotFoundError("Area not found");
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      throw new NotFoundError("Lokasi not found");
    }

    key = location.videoUrl ? location.videoUrl : "spiout.mp4";

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        throw new NotFoundError("Assets not found");
      }

      const url = file.presign({
        expiresIn: 60 * 60 * 24 * 7,
      });

      return {
        key,
        url,
      };
    } catch (error) {
      console.error("[AssetService] [getDisplayAsset]", error);
      throw error;
    }
  }

  async getDownloadFile(key: string) {
    const file = minio.file(key);

    if (!(await file.exists())) {
      throw new Error("File not found");
    }

    return {
      file,
      stat: await file.stat(),
    };
  }

  async initUpload(fileName: string, totalChunks: number) {
    const uploadId = crypto.randomUUID();
    const key = `${env.BUCKET_NAME}/${fileName}/${uploadId}.mp4`;

    await this.assetRepository.createSession(uploadId, {
      key,
      totalChunks,
      uploaded: [],
      status: "UPLOADING",
    });

    return { uploadId, key };
  }

  async uploadChunk(uploadId: string, index: number, buffer: Buffer) {
    const session = await this.assetRepository.getSession(uploadId);

    if (!session) throw new NotFoundError("Session not found");

    await minio.write(`${session.key}.part${index}`, buffer);

    session.uploaded.push(index);

    await this.assetRepository.updateSession(uploadId, session);
  }

  async completeUpload(uploadId: string) {
    const session = await this.assetRepository.getSession(uploadId);
    if (!session) throw new NotFoundError("Session not found");
    session.status = "UPLOADED";
    await this.assetRepository.updateSession(uploadId, session);
    await this.assetRepository.pushScanQueue(session.key);
    return session;
  }
}
