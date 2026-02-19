import { redirect } from "next/navigation";

import { Separator } from "@acme/ui";

import { getSession } from "~/auth/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const { user } = session;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil de Usuario</h3>
        <p className="text-muted-foreground text-sm">
          Administra tu información personal y configuración.
        </p>
      </div>
      <Separator />

      <ProfileForm
        user={{
          name: user.name || "",
          email: user.email || "",
          image: user.image,
        }}
      />
    </div>
  );
}
