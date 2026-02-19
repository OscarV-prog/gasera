const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const columns =
      await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicles'`;
    const colNames = columns.map((c) => c.column_name);
    console.log("ACTUAL COLUMNS:", colNames);

    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    const tenant_id = orgs[0].id;

    const vehicles = [
      {
        id: "v1",
        license_plate: "ABC-123",
        vehicle_type: "pickup",
        brand: "Ford",
        model: "F-150",
        year: 2022,
        status: "active",
      },
      {
        id: "v2",
        license_plate: "XYZ-789",
        vehicle_type: "pickup",
        brand: "Chevrolet",
        model: "Silverado",
        year: 2021,
        status: "maintenance",
      },
      {
        id: "v3",
        license_plate: "DEF-456",
        vehicle_type: "pickup",
        brand: "Toyota",
        model: "Hilux",
        year: 2023,
        status: "active",
      },
    ];

    for (const v of vehicles) {
      const data = {
        id: v.id,
        tenant_id: tenant_id,
        license_plate: v.license_plate,
        vehicle_type: v.vehicle_type,
        brand: v.brand,
        model: v.model,
        year: v.year,
        status: v.status,
      };

      // Add timestamps if they exist
      if (colNames.includes("updated_at")) data.updated_at = new Date();
      if (colNames.includes("created_at")) data.created_at = new Date();
      if (colNames.includes("updatedAt")) data.updatedAt = new Date();
      if (colNames.includes("createdAt")) data.createdAt = new Date();

      await sql`
                INSERT INTO vehicles ${sql(data)}
                ON CONFLICT (id) DO NOTHING
            `;
      console.log("Seeded:", v.license_plate);
    }
    console.log("Finished!");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
