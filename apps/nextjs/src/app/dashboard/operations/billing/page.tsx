"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Search,
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

export default function BillingPage() {
  const [status, setStatus] = useState<string>("all");
  const api = useTRPC();

  const { data, isLoading } = useQuery(
    api.operations.listBillingRequests.queryOptions({
      status: status === "all" ? undefined : (status as any),
      limit: 50,
    }),
  );

  const statusColors: Record<string, string> = {
    requested: "bg-amber-100 text-amber-800",
    pending: "bg-blue-100 text-blue-800",
    approved: "bg-indigo-100 text-indigo-800",
    issued: "bg-green-100 text-green-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Solicitudes de Facturación
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestión de CFDI y requerimientos fiscales de clientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Lote
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="space-y-6 lg:col-span-1">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
              <Filter className="h-4 w-4 text-blue-500" />
              Filtros
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Estado del CFDI
                </label>
                <div className="flex flex-col gap-1">
                  {["all", "requested", "issued", "delivered", "rejected"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${status === s ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"}`}
                      >
                        {s === "all"
                          ? "Todos"
                          : s.replace("_", " ").toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-blue-600 p-6 text-white shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-white/20 p-2">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-black uppercase italic">
                SLA Fiscal
              </h4>
            </div>
            <p className="mb-4 text-xs font-medium text-blue-100">
              92% de las facturas generadas en menos de 24h.
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[92%] bg-white"></div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="RFC, Cliente o Folio..."
                className="h-10 border-none pl-10 shadow-none focus-visible:ring-0 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {isLoading ? (
              <div className="p-12 text-center text-gray-400">
                Consultando base de datos...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/50">
                    <TableHead className="font-bold">Cliente / RFC</TableHead>
                    <TableHead className="font-bold">Monto</TableHead>
                    <TableHead className="font-bold">Estado</TableHead>
                    <TableHead className="font-bold">Fecha</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.requests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="group cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell>
                        <div className="text-sm font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                          {req.businessName || req.customerName}
                        </div>
                        <div className="font-mono text-[10px] text-gray-400">
                          {req.taxId}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-gray-900 dark:text-gray-100">
                        ${Number(req.totalAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${statusColors[req.status]}`}
                        >
                          {req.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(req.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {req.status === "issued" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 group-hover:text-blue-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.requests.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="p-12 text-center text-gray-400 dark:text-gray-500"
                      >
                        Sin solicitudes pendientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
