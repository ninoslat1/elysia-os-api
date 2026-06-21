import type { S3File } from "bun";
import { minio } from "../lib/minio";
import { AreaRepository } from "../repositories/area.repository";
import { LocationRepository } from "../repositories/location.repository";
import { BadRequestError, NotFoundError } from "../lib/error";
import { env } from "../env";

export class AssetsService {
  constructor(
    private readonly areaRepository = new AreaRepository(),
    private readonly locationRepository = new LocationRepository(),
  ) {}

  async getDisplayAsset(uid: string) {
    let key: string;
    const areaId = await this.areaRepository.findAreaLocationIDByUid({ uid });

    if (!areaId) {
      throw new NotFoundError("Area not found");
      // console.error("[AssetService] [getDisplayAsset]", { uid, error: "Area not found" });
      // return null;
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      throw new NotFoundError("Lokasi not found");
      // console.error("[AssetService] [getDisplayAsset]", { uid, error: "Lokasi not found" });
      // return null;
    }

    key = location.videoUrl ? location.videoUrl : "spiout.mp4";

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        // return null;
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
      // console.error("[AssetService] [getDisplayAsset]", { uid, error: "Area tidak ditemukan" });
      // return null;
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      throw new NotFoundError("Lokasi not found");
      // console.error("[AssetService] [getDisplayAsset]", { uid, error: "Lokasi tidak ditemukan" });
      // return null;
    }

    // if (location.name.toLocaleLowerCase() === "balikpapan superblock") {
    //   key = `bsb.mp4`;
    // } else {
    //   key = `spiout.mp4`;
    // }

    key = location.videoUrl ? location.videoUrl : "spiout.mp4";

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        // return null;
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

  async writeVideoFile(file: S3File) {
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
  }
}
