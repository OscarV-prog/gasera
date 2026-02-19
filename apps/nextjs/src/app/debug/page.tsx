import { headers } from "next/headers";

import { auth } from "~/auth/server";

export default async function DebugPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const headersList = await headers();
  const allHeaders: Record<string, string> = {};
  headersList.forEach((value, key) => {
    allHeaders[key] = value;
  });

  return (
    <div className="p-8 font-mono text-xs">
      <h1 className="mb-4 text-xl font-bold">Auth Debugger</h1>

      <div className="grid gap-8">
        <section>
          <h2 className="mb-2 text-lg font-bold text-blue-600">
            Session State
          </h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(session, null, 2)}
          </pre>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-bold text-green-600">
            Request Headers
          </h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(allHeaders, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
