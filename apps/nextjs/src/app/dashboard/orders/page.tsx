"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";

import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const api = useTRPC();

  const ordersQuery = useQuery(
    api.orders.list.queryOptions({
      search: search || undefined,
      status: status === "all" ? undefined : (status as any),
      page,
      limit: 20,
    }),
  );
  const data = ordersQuery.data;
  const isLoading = ordersQuery.isLoading;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      assigned: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
      failed: "bg-red-100 text-red-800 border-red-200",
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="mr-1 h-3 w-3" />,
      assigned: <Plus className="mr-1 h-3 w-3" />,
      in_progress: <Truck className="mr-1 h-3 w-3" />,
      delivered: <CheckCircle2 className="mr-1 h-3 w-3" />,
      cancelled: <XCircle className="mr-1 h-3 w-3" />,
      failed: <AlertCircle className="mr-1 h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${styles[status] || ""}`}
      >
        {icons[status]}
        {status.replace("_", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: "text-gray-600",
      normal: "text-blue-600",
      high: "text-orange-600 font-bold",
      urgent: "text-red-600 font-bold animate-pulse",
    };

    return (
      <span
        className={`text-xs tracking-tighter uppercase ${styles[priority] || ""}`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Gestión de Pedidos
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Monitoreo y administración del flujo de entrega.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/orders/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por número de pedido o notas..."
            className="pl-10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos los Estados</option>
          <option value="pending">Pendientes</option>
          <option value="assigned">Asignados</option>
          <option value="in_progress">En Ruta</option>
          <option value="delivered">Entregados</option>
          <option value="cancelled">Cancelados</option>
          <option value="failed">Fallidos</option>
        </select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros Avanzados
        </Button>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">
              Cargando pedidos...
            </p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-gray-50 p-4">
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No se encontraron pedidos
            </h3>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Usa los filtros o crea un nuevo pedido para comenzar a trabajar.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/orders/new">
                <Button variant="outline">Crear primer pedido</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableHead className="w-[140px] font-bold">
                      Pedido #
                    </TableHead>
                    <TableHead className="font-bold">Cliente</TableHead>
                    <TableHead className="text-center font-bold">
                      Estado
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      Prioridad
                    </TableHead>
                    <TableHead className="font-bold">Solicitado</TableHead>
                    <TableHead className="text-right font-bold">
                      Monto
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((order: any) => (
                    <TableRow
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-bold text-blue-600">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Cliente #{order.customerId.substring(0, 5)}
                          </span>
                          <span className="max-w-[150px] truncate text-xs text-gray-500">
                            Ref: {order.id.substring(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPriorityBadge(order.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {new Date(order.requestedDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.requestedDate).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100">
                        ${Number(order.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/30">
              <div className="text-sm text-gray-500">
                Mostrando{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {(page - 1) * 20 + 1}-{Math.min(page * 20, data.total)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {data.total}
                </span>{" "}
                pedidos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8"
                >
                  Anterior
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                  {page} / {data.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="h-8"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
