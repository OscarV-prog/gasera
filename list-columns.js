const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'vehicles'
        `;
    console.log("Columns in 'vehicles':", JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
