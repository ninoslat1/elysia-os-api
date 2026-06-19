import { minio } from "../lib/minio";
import { AreaRepository } from "../repositories/area.repository";
import { LocationRepository } from "../repositories/location.repository";

export class AssetsService {
  constructor(
    private readonly areaRepository = new AreaRepository(),
    private readonly locationRepository = new LocationRepository(),
  ) {}

  async getDisplayAsset(uid: string) {
    let key: string;
    const areaId = await this.areaRepository.findAreaLocationIDByUid({ uid });

    if (!areaId) {
      console.error("[AssetService] [getDisplayAsset]", { uid, error: "Area tidak ditemukan" });
      return null;
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      console.error("[AssetService] [getDisplayAsset]", { uid, error: "Lokasi tidak ditemukan" });
      return null;
    }

    if (location.name.toLocaleLowerCase() === "balikpapan superblock") {
      key = `bsb.mp4`;
    } else {
      key = `spiout.mp4`;
    }

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        return null;
      }

      return {
        key,
        file,
        stat: await file.stat(),
      };
    } catch (error) {
      console.error("[AssetService] [getDisplayAsset]", error);

      return null;
    }
  }

  async getDisplayAssetV2(uid: string) {
    let key: string;
    const areaId = await this.areaRepository.findAreaLocationIDByUid({ uid });

    if (!areaId) {
      console.error("[AssetService] [getDisplayAsset]", { uid, error: "Area tidak ditemukan" });
      return null;
    }

    const location = await this.locationRepository.findLocationByAreaId({ id: areaId });

    if (!location) {
      console.error("[AssetService] [getDisplayAsset]", { uid, error: "Lokasi tidak ditemukan" });
      return null;
    }

    if (location.name.toLocaleLowerCase() === "balikpapan superblock") {
      key = `bsb.mp4`;
    } else {
      key = `spiout.mp4`;
    }

    try {
      const file = minio.file(key);

      if (!(await file.exists())) {
        return null;
      }

      const url = file.presign({
        expiresIn: 60 * 60 * 24 * 7
      })

      return {
        key,
        url
      };
    } catch (error) {
      console.error("[AssetService] [getDisplayAsset]", error);

      return null;
    }
  }

  async getDownloadFile(key: string) {
    const file = minio.file(key);

    if (!(await file.exists())) {
      return null;
    }

    return {
      file,
      stat: await file.stat(),
    };
  }
}
