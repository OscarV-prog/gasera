import { db } from "./packages/db/src/client.ts";
import { user } from "./packages/db/src/schema.ts";

async function main() {
  const allUsers = await db.select().from(user).limit(5);
  console.log("Users in DB:", JSON.stringify(allUsers, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
