import { db } from "./packages/db/src/client.ts";
import { vehicles } from "./packages/db/src/schema.ts";

async function main() {
  const allVehicles = await db.select().from(vehicles);
  console.log("Vehicles in DB:", JSON.stringify(allVehicles, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
