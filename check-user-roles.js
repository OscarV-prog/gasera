const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const users = await sql`SELECT id, email, role, tenant_id FROM "user"`;
    console.log("USERS:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
