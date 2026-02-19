"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  History,
  Plus,
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

export default function ReconciliationPage() {
  const [status, setStatus] = useState<string>("all");
  const api = useTRPC();

  const { data, isLoading } = useQuery(
    api.operations.listReturnLoads.queryOptions({
      status: status === "all" ? undefined : (status as any),
      limit: 20,
    }),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Conciliación de Inventario
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Control de retornos de activos y discrepancias de fin de día.
          </p>
        </div>
        <Link href="/dashboard/operations/reconciliation/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Conciliación
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatusCard
          label="Pendientes"
          value={data?.loads.filter((l) => l.status === "pending").length ?? 0}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          bgColor="bg-amber-50"
        />
        <StatusCard
          label="Completadas"
          value={
            data?.loads.filter((l) => l.status === "completed").length ?? 0
          }
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatusCard
          label="Discrepancias"
          value={
            data?.loads.filter((l) => (l.totalMissing ?? 0) > 0).length ?? 0
          }
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          bgColor="bg-red-50"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por vehículo o conductor..."
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Todos los Estados</option>
          <option value="pending">Pendientes</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Procesando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-bold">Fecha</TableHead>
                <TableHead className="font-bold">Vehículo</TableHead>
                <TableHead className="font-bold">Conductor</TableHead>
                <TableHead className="text-center font-bold">Full</TableHead>
                <TableHead className="text-center font-bold">Vacíos</TableHead>
                <TableHead className="text-center font-bold text-red-600">
                  Discrep.
                </TableHead>
                <TableHead className="text-center font-bold">Estado</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.loads.map((load) => (
                <TableRow
                  key={load.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <TableCell className="text-sm font-medium">
                    {new Date(load.returnDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">
                    {load.vehicleId.substring(0, 8)}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {load.driverId?.substring(0, 8) || "N/A"}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {load.totalFullReturned}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {load.totalEmptyReturned}
                  </TableCell>
                  <TableCell className="text-center font-bold text-red-600">
                    {(load.totalMissing ?? 0) + (load.totalDamaged ?? 0) > 0 ? (
                      <span className="flex items-center justify-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {(load.totalMissing ?? 0) + (load.totalDamaged ?? 0)}
                      </span>
                    ) : (
                      "0"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                        load.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : load.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {load.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/operations/reconciliation/${load.id}`}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  icon,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-gray-100 p-4 shadow-sm ${bgColor}`}
    >
      <div>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          {label}
        </p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
      <div className="rounded-lg bg-white/50 p-2 shadow-sm">{icon}</div>
    </div>
  );
}
