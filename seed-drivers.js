const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const orgs = await sql`SELECT id FROM "organizations" LIMIT 1`;
    if (orgs.length === 0) {
      console.error("No organization found.");
      process.exit(1);
    }
    const tenant_id = orgs[0].id;
    console.log("Using tenant:", tenant_id);

    const driverData = [
      {
        id: "d1",
        tenant_id,
        name: "Juan Pérez",
        email: "juan.perez@gasera.com",
        phone: "555-0101",
        license_number: "LIC-1001",
        assigned_unit_id: "v1",
        status: "available",
      },
      {
        id: "d2",
        tenant_id,
        name: "María García",
        email: "maría.garcia@gasera.com",
        phone: "555-0102",
        license_number: "LIC-1002",
        assigned_unit_id: "v2",
        status: "available",
      },
      {
        id: "d3",
        tenant_id,
        name: "Carlos Rodríguez",
        email: "carlos.rod@gasera.com",
        phone: "555-0103",
        license_number: "LIC-1003",
        assigned_unit_id: null,
        status: "disconnected",
      },
    ];

    for (const d of driverData) {
      await sql`
                INSERT INTO "drivers" (id, tenant_id, name, email, phone, license_number, assigned_unit_id, status, updated_at)
                VALUES (${d.id}, ${d.tenant_id}, ${d.name}, ${d.email}, ${d.phone}, ${d.license_number}, ${d.assigned_unit_id}, ${d.status}, now())
                ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    phone = EXCLUDED.phone,
                    license_number = EXCLUDED.license_number,
                    assigned_unit_id = EXCLUDED.assigned_unit_id,
                    status = EXCLUDED.status,
                    updated_at = now()
            `;
      console.log("Seeded driver:", d.name);

      // Also update the vehicle to point to this driver if assigned
      if (d.assigned_unit_id) {
        await sql`
                    UPDATE "vehicles" SET assigned_driver_id = ${d.id} WHERE id = ${d.assigned_unit_id}
                `;
        console.log(`Assigned driver ${d.id} to vehicle ${d.assigned_unit_id}`);
      }
    }

    console.log("DONE");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
