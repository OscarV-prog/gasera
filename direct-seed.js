const postgres = require("./packages/db/node_modules/postgres");

const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    // 1. Get first organization
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    if (orgs.length === 0) {
      console.log("Creating default organization...");
      await sql`INSERT INTO organizations (id, name, contact_email, updated_at) VALUES ('org_default', 'Gasera Org', 'admin@gasera.com', now())`;
      orgs.push({ id: "org_default" });
    }

    const tenant_id = orgs[0].id;
    console.log("Using tenant:", tenant_id);

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
      await sql`
                INSERT INTO vehicles (id, tenant_id, license_plate, vehicle_type, brand, model, year, status)
                VALUES (${v.id}, ${tenant_id}, ${v.license_plate}, ${v.vehicle_type}, ${v.brand}, ${v.model}, ${v.year}, ${v.status})
                ON CONFLICT (license_plate, tenant_id) DO NOTHING
            `;
      console.log("Processed:", v.license_plate);
    }

    console.log("Seed completed successfully!");
  } catch (err) {
    console.error("Error during seed:", err);
  } finally {
    await sql.end();
  }
}

main();
