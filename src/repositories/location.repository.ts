import { dbMst } from "../db";
import { locationTable } from "../db/schemas/location";
import { eq } from "drizzle-orm";
import type { FindLocationByIdDTO, UpdateVideoURLDTO } from "../types/location";

export class LocationRepository {
  async findLocationByAreaId(
    dto: FindLocationByIdDTO,
  ): Promise<typeof locationTable.$inferSelect | null> {
    const { id } = dto;

    try {
      const [result] = await dbMst
        .select()
        .from(locationTable)
        .where(eq(locationTable.id, id))
        .limit(1);

      return result ?? null;
    } catch (error) {
      console.error("[LocationRepository] [findLocationByAreaId]", {
        id,
        error,
      });

      throw error;
    }
  }

  async updateVideoUrl(dto: UpdateVideoURLDTO) {
    const { locationUid, videoUrl } = dto;

    const [result] = await dbMst
      .select()
      .from(locationTable)
      .where(eq(locationTable.uid, locationUid))
      .limit(1);

    if (!result) {
      throw new Error("Location not found");
    }

    await dbMst
      .update(locationTable)
      .set({
        videoUrl,
      })
      .where(eq(locationTable.uid, locationUid));

    return true;
  }
}
