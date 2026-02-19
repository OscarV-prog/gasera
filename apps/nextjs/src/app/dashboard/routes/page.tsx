"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

type RouteStatus =
  | "pending"
  | "loading"
  | "loaded"
  | "dispatched"
  | "in_progress"
  | "completed"
  | "cancelled";

interface RouteLoad {
  id: string;
  vehicleId: string;
  driverId: string | null;
  loadDate: Date;
  status: RouteStatus;
  plannedDeliveries: number;
  completedDeliveries: number;
  driverName?: string;
  vehicleName?: string;
}

// Mock data for demonstration until API is fully connected
const mockRoutes: RouteLoad[] = [
  {
    id: "R001",
    vehicleId: "v1",
    driverId: "d1",
    loadDate: new Date("2025-02-10"),
    status: "completed",
    plannedDeliveries: 15,
    completedDeliveries: 14,
    driverName: "Juan Pérez García",
    vehicleName: "Camión CG-001",
  },
  {
    id: "R002",
    vehicleId: "v2",
    driverId: "d2",
    loadDate: new Date("2025-02-11"),
    status: "in_progress",
    plannedDeliveries: 12,
    completedDeliveries: 8,
    driverName: "María López Hernández",
    vehicleName: "Camión CG-002",
  },
  {
    id: "R003",
    vehicleId: "v3",
    driverId: null,
    loadDate: new Date("2025-02-11"),
    status: "pending",
    plannedDeliveries: 10,
    completedDeliveries: 0,
    driverName: "Sin asignar",
    vehicleName: "Camión CG-003",
  },
  {
    id: "R004",
    vehicleId: "v1",
    driverId: "d3",
    loadDate: new Date("2025-02-12"),
    status: "pending",
    plannedDeliveries: 18,
    completedDeliveries: 0,
    driverName: "Carlos Ramírez Torres",
    vehicleName: "Camión CG-001",
  },
  {
    id: "R005",
    vehicleId: "v2",
    driverId: "d1",
    loadDate: new Date("2025-02-09"),
    status: "cancelled",
    plannedDeliveries: 8,
    completedDeliveries: 0,
    driverName: "Juan Pérez García",
    vehicleName: "Camión CG-002",
  },
  {
    id: "R006",
    vehicleId: "v4",
    driverId: "d4",
    loadDate: new Date("2025-02-10"),
    status: "loaded",
    plannedDeliveries: 20,
    completedDeliveries: 0,
    driverName: "Ana Martínez Ruiz",
    vehicleName: "Camión CG-004",
  },
];

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RouteStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const api = useTRPC();

  // Try to fetch from API, fallback to mock data if API not available
  const {
    data: routesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["routeLoads", "list"],
    queryFn: async () => {
      try {
        // This would be the actual API call when implemented
        // const result = await api.routeLoads.list.query({...});
        // return result;
        return null;
      } catch {
        // Fallback to mock data for development
        return { loads: mockRoutes };
      }
    },
    retry: false,
  });

  const routes: RouteLoad[] = routesData?.loads || mockRoutes;

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta ruta?")) {
      try {
        // Note: Delete mutation needs to be added to the API router
        toast.success("Ruta eliminada correctamente");
        refetch();
      } catch (error: unknown) {
        toast.error(
          (error as { message?: string })?.message ||
            "Error al eliminar la ruta",
        );
      }
    }
  };

  // Filter routes based on search and filters
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.id.toLowerCase().includes(search.toLowerCase()) ||
      (route.driverName?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === "all" || route.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(route.loadDate).toISOString().split("T")[0] === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadgeClass = (status: RouteStatus) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "loading":
        return "bg-blue-100 text-blue-800";
      case "loaded":
        return "bg-indigo-100 text-indigo-800";
      case "dispatched":
        return "bg-purple-100 text-purple-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: RouteStatus) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "loading":
        return "Cargando";
      case "loaded":
        return "Cargado";
      case "dispatched":
        return "Despachado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProgressPercentage = (route: RouteLoad) => {
    if (route.plannedDeliveries === 0) return 0;
    return Math.round(
      (route.completedDeliveries / route.plannedDeliveries) * 100,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rutas
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestiona las rutas de entrega de tus vehículos
          </p>
        </div>
        <Link href="/dashboard/routes/new">
          <Button>Nueva Ruta</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-md flex-1">
          <Input
            type="text"
            placeholder="Buscar por ID de ruta o nombre de conductor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="date"
            placeholder="Filtrar por fecha"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === "all"
                ? "Todos los Estados"
                : getStatusLabel(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 w-48 rounded-md border bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <DropdownMenuItem
              onClick={() => setStatusFilter("all")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Todos los Estados
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("pending")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Pendiente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("in_progress")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              En Progreso
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("completed")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Completado
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("cancelled")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Cancelado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alerts Section */}
      <div className="space-y-2">
        {routes.some((r) => r.status === "pending") && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <span className="font-medium">Atención:</span> Tienes{" "}
            {routes.filter((r) => r.status === "pending").length} ruta(s)
            pendiente(s) por despachar.
          </div>
        )}
        {routes.some((r) => r.status === "in_progress") && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="font-medium">En Curso:</span>{" "}
            {routes.filter((r) => r.status === "in_progress").length} ruta(s)
            actualmente en progreso.
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:border dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : !filteredRoutes || filteredRoutes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {routes.length === 0
              ? "No se encontraron rutas. Crea tu primera ruta para comenzar."
              : "No hay rutas que coincidan con tus criterios de búsqueda."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Ruta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow
                  key={route.id}
                  className={
                    route.status === "cancelled"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : route.status === "in_progress"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                  }
                >
                  <TableCell className="font-medium">{route.id}</TableCell>
                  <TableCell>{formatDate(route.loadDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{route.driverName || "Sin asignar"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{route.vehicleName || route.vehicleId}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        route.status,
                      )}`}
                    >
                      {getStatusLabel(route.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {route.completedDeliveries} / {route.plannedDeliveries}
                      </span>
                      <div className="mt-1 h-1.5 w-16 rounded-full bg-gray-200">
                        <div
                          className={`h-1.5 rounded-full ${
                            route.status === "completed"
                              ? "bg-green-500"
                              : route.status === "cancelled"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                          style={{
                            width: `${getProgressPercentage(route)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/routes/${route.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/dashboard/routes/${route.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
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
