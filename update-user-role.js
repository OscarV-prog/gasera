const postgres = require("./packages/db/node_modules/postgres");
const sql = postgres(
  "postgresql://postgres:MGEFLJTED17@db.ggehigoitxfydsirwakf.supabase.co:5432/postgres",
);

async function main() {
  try {
    const result =
      await sql`UPDATE "user" SET role = 'admin' WHERE email = 'josh.patys@gmail.com'`;
    console.log("UPDATE RESULT:", result);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
main();
