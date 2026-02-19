"use client";

import { useState } from "react"; // Added useState import
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query"; // Assuming useQuery is from this path
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Truck,
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
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function UnitsPage() {
  const api = useTRPC();
  const {
    data: units,
    isLoading,
    refetch,
  } = useQuery(api.vehicles.list.queryOptions());

  const deleteMutation = useMutation(
    api.vehicles.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Vehículo eliminado con éxito");
        void refetch();
      },
      onError: (error: any) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este vehículo?")) {
      deleteMutation.mutate({ id });
    }
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUnits = units?.filter((unit) => {
    const matchesSearch =
      unit.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      unit.model?.toLowerCase().includes(search.toLowerCase()) ||
      unit.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Unidades
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestión de vehículos y unidades de transporte
          </p>
        </div>
        <Link href="/dashboard/units/new">
          <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nueva Unidad
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por placa, modelo o chofer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="maintenance">En mantenimiento</option>
          <option value="retired">Retiradas</option>
        </select>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-500">Cargando unidades...</p>
          </div>
        ) : filteredUnits && filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                    <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {unit.licensePlate}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {unit.brand} {unit.model}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/units/${unit.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 uppercase">
                        Gestión
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href={`/dashboard/units/${unit.id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={(e) => handleDelete(unit.id, e)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <Badge
                  className={
                    unit.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : unit.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }
                >
                  {unit.status === "active"
                    ? "Activa"
                    : unit.status === "maintenance"
                      ? "Mantenimiento"
                      : "Inactiva"}
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] dark:border-gray-800"
                >
                  {unit.vehicleType.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-4 dark:border-gray-800">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-400 uppercase">
                    Chofer Asignado
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {unit.assignedDriverId ? "Asignado" : "Sin asignar"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-400 uppercase">
                    Capacidad
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {unit.capacityWeight} kg / {unit.capacityVolume} m³
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No se encontraron unidades.{" "}
            <Link href="/dashboard/units/new" className="text-blue-600">
              Registra la primera aquí.
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
