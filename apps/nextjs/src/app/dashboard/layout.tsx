import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  ThemeProvider,
  ThemeToggle,
} from "@acme/ui";

import { getSession } from "~/auth/server";
import { DashboardSidebar, SidebarNavContent } from "./_components/sidebar";
import { UserNav } from "./_components/user-nav";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        <div className="flex flex-1 flex-col">
          {/* Mobile Header & User Nav */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-gray-800 dark:bg-gray-900/80">
            <div className="flex items-center gap-4 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 bg-white p-0 dark:bg-gray-900"
                >
                  <SidebarNavContent />
                </SheetContent>
              </Sheet>
              <Link
                href="/dashboard"
                className="font-bold text-gray-900 dark:text-gray-100"
              >
                Gasera<span className="text-blue-600">.</span>
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden flex-col items-end text-right sm:flex">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {session.user.name ?? session.user.email}
                </p>
                <p className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {/* @ts-ignore */}
                  {session.user.role || "Usuario"}
                </p>
              </div>
              <UserNav
                user={{
                  name: session.user.name ?? "Usuario",
                  email: session.user.email ?? "",
                  image: session.user.image,
                }}
              />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto h-full max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
