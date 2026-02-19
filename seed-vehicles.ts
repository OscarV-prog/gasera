import { db } from "./packages/db/src/client.ts";
import { organizations, vehicles } from "./packages/db/src/schema.ts";

async function main() {
  const [firstOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .limit(1);

  if (!firstOrg) {
    console.error(
      "No organization found. Please log in to the app first to create one.",
    );
    process.exit(1);
  }

  console.log(`Using organization: ${firstOrg.id}`);

  const mockVehicles = [
    {
      id: crypto.randomUUID(),
      tenantId: firstOrg.id,
      licensePlate: "ABC-123",
      vehicleType: "pickup",
      brand: "Ford",
      model: "F-150",
      year: 2022,
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      tenantId: firstOrg.id,
      licensePlate: "XYZ-789",
      vehicleType: "pickup",
      brand: "Chevrolet",
      model: "Silverado",
      year: 2021,
      status: "maintenance",
    },
    {
      id: crypto.randomUUID(),
      tenantId: firstOrg.id,
      licensePlate: "DEF-456",
      vehicleType: "pickup",
      brand: "Toyota",
      model: "Hilux",
      year: 2023,
      status: "active",
    },
  ];

  for (const v of mockVehicles) {
    // Check if license plate exists
    const [existing] = await db
      .select()
      .from(vehicles)
      .where((table, { and, eq }) =>
        and(
          eq(table.licensePlate, v.licensePlate),
          eq(table.tenantId, v.tenantId),
        ),
      );

    if (!existing) {
      await db.insert(vehicles).values(v as any);
      console.log(`Inserted vehicle: ${v.licensePlate}`);
    } else {
      console.log(`Vehicle ${v.licensePlate} already exists.`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
