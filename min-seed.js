const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    const tenant_id = orgs[0].id;

    await sql`
            INSERT INTO vehicles (id, tenant_id, license_plate, vehicle_type, brand, model)
            VALUES ('v_min', ${tenant_id}, 'MIN-001', 'pickup', 'Brand', 'Model')
        `;
    console.log("Success!");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await sql.end();
  }
}
main();
