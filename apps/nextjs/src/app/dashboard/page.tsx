"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  HelpCircle,
  LayoutDashboard,
  Map,
  PlusCircle,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

import { useTRPC } from "~/trpc/react";

export default function DashboardPage() {
  const api = useTRPC();

  const { data: metrics, isLoading: isMetricsLoading } = useQuery(
    api.orders.getDashboardMetrics.queryOptions(),
  );

  const { data: customersCount } = useQuery(
    api.customers.list.queryOptions({ limit: 1 }),
  );

  const { data: driversData, isLoading: isDriversLoading } = useQuery(
    api.fleetDrivers.list.queryOptions({ limit: 1 }),
  );

  const { data: productsData, isLoading: isProductsLoading } = useQuery(
    api.products.list.queryOptions({ limit: 1 }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Panel de Administración
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Resumen general del sistema
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes Registrados"
          value={
            isMetricsLoading ? "..." : (customersCount?.total.toString() ?? "0")
          }
          description="Total de clientes activos"
          icon={<Users className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          title="Pedidos"
          value={
            isMetricsLoading ? "..." : (metrics?.counts.total.toString() ?? "0")
          }
          description="Todos los pedidos realizados"
          icon={<ShoppingCart className="h-6 w-6 text-purple-600" />}
          bgColor="bg-purple-50 dark:bg-purple-950"
        />
        <StatCard
          title="Choferes"
          value={
            isDriversLoading ? "..." : (driversData?.total.toString() ?? "0")
          }
          description="Choferes disponibles"
          icon={<Truck className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-50 dark:bg-green-950"
        />
        <StatCard
          title="Productos"
          value={
            isProductsLoading ? "..." : (productsData?.total.toString() ?? "0")
          }
          description="Productos en catálogo"
          icon={<LayoutDashboard className="h-6 w-6 text-orange-600" />}
          bgColor="bg-orange-50 dark:bg-orange-950"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Urgent Orders Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Pedidos Urgentes
            </h2>
            <Link
              href="/dashboard/orders?priority=urgent"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-4">
            {metrics?.urgentOrders && metrics.urgentOrders.length > 0 ? (
              metrics.urgentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Solicitado:{" "}
                      {new Date(order.requestedDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-400">
                      Urgente
                    </span>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Detalles →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No hay pedidos urgentes pendientes.
              </p>
            )}
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Accesos Rápidos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acciones frecuentes
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAccessCard
              title="Nuevo Pedido"
              description="Registrar orden de cliente"
              href="/dashboard/orders/new"
              icon={<PlusCircle className="h-5 w-5" />}
              color="bg-blue-600"
            />
            <QuickAccessCard
              title="Monitor de Flota"
              description="Seguimiento GPS en tiempo real"
              href="/dashboard/fleet"
              icon={<Map className="h-5 w-5" />}
              color="bg-indigo-600"
            />
            <QuickAccessCard
              title="Gestionar Clientes"
              description="Administrar base de clientes"
              href="/dashboard/customers"
              icon={<Users className="h-5 w-5" />}
              color="bg-emerald-600"
            />
            <QuickAccessCard
              title="Centro de Ayuda"
              description="FAQ y soporte técnico"
              href="/dashboard/support/faq"
              icon={<HelpCircle className="h-5 w-5" />}
              color="bg-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  bgColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div
          className={`rounded-lg p-3 ${bgColor ?? "bg-gray-50 dark:bg-gray-800"}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </dt>
        <dd className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {value}
        </dd>
        <dd className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {description}
        </dd>
      </div>
    </div>
  );
}

function QuickAccessCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-transparent hover:shadow-lg hover:ring-2 hover:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:ring-blue-400"
    >
      <div className={`rounded-lg ${color} p-2.5 text-white shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
