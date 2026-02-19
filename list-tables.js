const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const tables =
      await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("TABLES:", tables.map((t) => t.table_name).join(", "));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
