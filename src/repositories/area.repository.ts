import { dbMst } from "../db";
import { eq } from "drizzle-orm";
import { areaTable } from "../db/schemas/area";
import type { FindAreaByUidDTO } from "../types/area";

export class AreaRepository {
  async findAreaLocationIDByUid(dto: FindAreaByUidDTO): Promise<number | null> {
    const { uid } = dto;

    try {
      const [result] = await dbMst
        .select({ id: areaTable.locationId })
        .from(areaTable)
        .where(eq(areaTable.uid, uid))
        .limit(1);

      return result?.id ?? null;
    } catch (error) {
      console.error("[AreaRepository] [findAreaLocationIDByUid]", {
        uid,
        error,
      });

      throw error;
    }
  }
}
