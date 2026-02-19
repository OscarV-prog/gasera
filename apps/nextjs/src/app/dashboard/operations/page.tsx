"use client";

import Link from "next/link";
import { CreditCard, FileText, TrendingUp } from "lucide-react";

import { Button } from "@acme/ui";

const operationsModules = [
  {
    title: "Facturación",
    description: "Gestión de facturas y cobros",
    href: "/dashboard/operations/billing",
    icon: CreditCard,
  },
  {
    title: "Reportes",
    description: "Reportes operacionales y análisis",
    href: "/dashboard/operations/reports",
    icon: TrendingUp,
  },
  {
    title: "Reconciliación",
    description: "Reconciliación de fin de día",
    href: "/dashboard/operations/reconciliation",
    icon: FileText,
  },
];

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-gray-100">
          Operaciones
        </h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Gestión operacional, facturación y reportes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {operationsModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <div className="cursor-pointer rounded-lg border bg-white p-6 shadow-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <module.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-gray-100">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {module.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" className="w-full">
                Abrir módulo →
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
