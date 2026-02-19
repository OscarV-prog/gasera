"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function DriverReportsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const limit = 20;

  const api = useTRPC();

  const reportsQuery = useQuery(
    api.reports.listDriverReports.queryOptions({
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      limit,
      offset: (page - 1) * limit,
    }),
  );

  const data = reportsQuery.data;
  const isLoading = reportsQuery.isLoading;

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Pendiente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            En Progreso
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Resuelto
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            Cerrado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge
            variant="destructive"
            className="border-red-200 bg-red-100 text-red-700 hover:bg-red-100"
          >
            Alta
          </Badge>
        );
      case "medium":
        return (
          <Badge className="border-yellow-200 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Media
          </Badge>
        );
      case "low":
        return (
          <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
            Baja
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Reportes de Choferes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Seguimiento de incidentes en tiempo real.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-start gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar reporte..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Estado" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="resolved">Resuelto</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Prioridad" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="w-[120px]">Folio</TableHead>
              <TableHead>Incidencia</TableHead>
              <TableHead>Chofer</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  Cargando reportes...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-500"
                >
                  No se encontraron reportes coincidenes.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((report: any) => (
                <TableRow
                  key={report.id}
                  className="hover:bg-accent/40 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-bold text-orange-600">
                    {report.reportNumber}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {report.issueType || "Reporte"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {report.driverId.substring(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(report.createdAt), "d/M/yyyy HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-500">
              Página {page} de {totalPages} ({data.total} reportes)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
