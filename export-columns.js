const postgres = require("./packages/db/node_modules/postgres");
const fs = require("fs");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const columns = await sql`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'vehicles'
        `;
    const names = columns.map((c) => c.column_name).join(", ");
    fs.writeFileSync("columns.txt", names);
    console.log("DONE");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
