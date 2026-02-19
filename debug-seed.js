const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    const tenant_id = orgs[0].id;

    const v = {
      id: "v_seed_1",
      tenant_id,
      license_plate: "ABC-123",
      vehicle_type: "pickup",
      brand: "Ford",
      model: "F-150",
      year: 2022,
      status: "active",
    };

    console.log("Attempting to insert:", v);

    await sql`
            INSERT INTO vehicles (id, tenant_id, license_plate, vehicle_type, brand, model, year, status)
            VALUES (${v.id}, ${v.tenant_id}, ${v.license_plate}, ${v.vehicle_type}, ${v.brand}, ${v.model}, ${v.year}, ${v.status})
            ON CONFLICT DO NOTHING
        `;

    console.log("Success!");
  } catch (err) {
    console.error(
      "FULL ERROR:",
      JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
    );
  } finally {
    await sql.end();
  }
}
main();
