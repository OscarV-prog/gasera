const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const columns = await sql`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'drivers'
        `;
    console.log("COLUMNS:", columns.map((c) => c.column_name).join(", "));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
