import net from "net";
import { env } from "../env";

export function scanBuffer(buffer: Buffer): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(Number.parseInt(env.CLAMAV_PORT), env.CLAMAV_IP);

    client.write("zINSTREAM\0");
    client.write(buffer);
    client.write(Buffer.from([0, 0, 0, 0]));

    client.on("data", (data) => {
      resolve(!data.toString().includes("FOUND"));
      client.end();
    });

    client.on("error", reject);
  });
}
