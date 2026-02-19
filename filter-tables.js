const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const tables =
      await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'org%' OR table_name LIKE 'veh%')`;
    console.log(
      "MATCHES:",
      tables.map((t) => t.table_name),
    );
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
