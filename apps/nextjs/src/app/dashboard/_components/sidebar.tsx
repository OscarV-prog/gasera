"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Fuel,
  Home,
  Info,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Package,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import { cn } from "@acme/ui";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Choferes", href: "/dashboard/drivers", icon: Truck },
  {
    name: "Reportes de Clientes",
    href: "/dashboard/reports/customers",
    icon: TrendingUp,
  },
  {
    name: "Reportes de Choferes",
    href: "/dashboard/reports/drivers",
    icon: ClipboardList,
  },
  {
    name: "Soporte Técnico",
    href: "/dashboard/support/contacts",
    icon: LifeBuoy,
  },
  { name: "App Info", href: "/dashboard/app-info", icon: Info },
  { name: "Unidades", href: "/dashboard/units", icon: Truck },
];

const secondaryNavigation = [
  { name: "Pedidos", href: "/dashboard/orders", icon: Box },
  {
    name: "Programación del día",
    href: "/dashboard/scheduling",
    icon: Calendar,
  },
  { name: "Entregas", href: "/dashboard/deliveries", icon: Package },
  { name: "Productos", href: "/dashboard/products", icon: LayoutDashboard },
  { name: "Mensajería", href: "/dashboard/messages", icon: Mail },
  {
    name: "Facturación",
    href: "/dashboard/operations/billing",
    icon: CreditCard,
  },
  { name: "Preguntas Frecuentes", href: "/dashboard/faqs", icon: Info },
  { name: "Reportes", href: "/dashboard/reports", icon: FileText },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-white md:block md:w-64 lg:w-72 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight text-slate-900 dark:text-gray-100">
              Gasera<span className="text-blue-600">.</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            <div className="mb-2 px-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-gray-500">
              Principal
            </div>
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 group-hover:text-slate-500 dark:text-gray-500",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            <div className="mt-8 mb-2 px-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-gray-500">
              Operaciones
            </div>
            {secondaryNavigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400 dark:text-gray-500",
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t p-4 dark:border-gray-800">
          {/* User Profile Summary or simpler footer */}
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              Versión 2.0.1
            </p>
            <p className="text-[10px] text-slate-400 dark:text-gray-500">
              © 2026 Gasera Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
