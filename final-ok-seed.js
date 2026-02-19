const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const orgs = await sql`SELECT id FROM "organizations" LIMIT 1`;
    if (orgs.length === 0) {
      console.log("Creating default organization...");
      await sql`INSERT INTO "organizations" (id, name, contact_email, updated_at) VALUES ('org_default', 'Gasera Org', 'admin@gasera.com', now())`;
      orgs.push({ id: "org_default" });
    }
    const tenant_id = orgs[0].id;

    const vehicles = [
      {
        id: "v1",
        tenant_id,
        license_plate: "ABC-123",
        vehicle_type: "pickup",
        brand: "Ford",
        model: "F-150",
        year: 2022,
        status: "active",
      },
      {
        id: "v2",
        tenant_id,
        license_plate: "XYZ-789",
        vehicle_type: "pickup",
        brand: "Chevrolet",
        model: "Silverado",
        year: 2021,
        status: "maintenance",
      },
      {
        id: "v3",
        tenant_id,
        license_plate: "DEF-456",
        vehicle_type: "pickup",
        brand: "Toyota",
        model: "Hilux",
        year: 2023,
        status: "active",
      },
    ];

    for (const v of vehicles) {
      await sql`
                INSERT INTO "vehicles" (id, tenant_id, license_plate, vehicle_type, brand, model, year, status, updated_at)
                VALUES (${v.id}, ${v.tenant_id}, ${v.license_plate}, ${v.vehicle_type}, ${v.brand}, ${v.model}, ${v.year}, ${v.status}, now())
                ON CONFLICT (id) DO NOTHING
            `;
      console.log("Processed:", v.license_plate);
    }
    console.log("DONE");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
