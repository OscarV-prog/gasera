"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const api = useTRPC();

  const driversQuery = useQuery(
    api.fleetDrivers.list.queryOptions({
      search: search || undefined,
      limit,
      offset: (page - 1) * limit,
    }),
  );

  const data = driversQuery.data;
  const isLoading = driversQuery.isLoading;

  const deleteMutation = useMutation(
    api.fleetDrivers.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Chofer eliminado con éxito");
        void driversQuery.refetch();
      },
      onError: (error: any) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este chofer?")) {
      deleteMutation.mutate({ id });
    }
  };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Choferes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la flota de choferes y sus asignaciones.
          </p>
        </div>
        <Link href="/dashboard/drivers/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Chofer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o licencia..."
            className="rounded-xl pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/20 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[300px]">Chofer</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Unidad Asignada</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Cargando choferes...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-gray-400"
                >
                  No se encontraron choferes registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((driver) => (
                <TableRow
                  key={driver.id}
                  className="group transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm dark:border-gray-800">
                        <AvatarFallback className="bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                          {(driver.name || "C").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {driver.name}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 uppercase">
                          ID: {driver.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span>{driver.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="h-3 w-3" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-gray-50 font-mono text-[10px] dark:bg-gray-800"
                    >
                      {driver.licenseNumber}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {driver.vehicleLicensePlate ? (
                      <Badge className="border-none bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Truck className="mr-1 h-3 w-3" />
                        Unidad {driver.vehicleLicensePlate}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        driver.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {driver.status === "active" ? "Activo" : "Desconectado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/drivers/${driver.id}`}>
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
                            Opciones
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/dashboard/drivers/${driver.id}/edit`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(driver.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination etc (same logic) */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-500">
              Página {page} de {totalPages} ({data.total} choferes)
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
