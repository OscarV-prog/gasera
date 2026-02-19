"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Copy,
  Edit,
  Eye,
  History,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
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

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const api = useTRPC();

  const customersQuery = useQuery(
    api.customers.list.queryOptions({
      search: search || undefined,
      offset: (page - 1) * 20,
      limit: 20,
    }),
  );

  const deleteMutation = useMutation(api.customers.delete.mutationOptions());

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success("Cliente eliminado con éxito");
            void customersQuery.refetch();
          },
          onError: (err: any) => {
            toast.error(`Error al eliminar: ${err.message}`);
          },
        },
      );
    }
  };

  const data = customersQuery.data;
  const isLoading = customersQuery.isLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona tu base de datos de clientes y sus pedidos.
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-blue-600 font-semibold shadow-lg hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            className="pl-9 dark:bg-gray-800/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[300px]">Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Dir.</TableHead>
              <TableHead className="text-center">Pedidos</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    Cargando clientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-500"
                >
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="group relative transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-800">
                        <AvatarFallback className="bg-blue-50 font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {(customer.businessName || "C")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                          {customer.businessName || "Sin Nombre"}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 dark:text-gray-500">
                          {customer.customerCode}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] dark:border-gray-700"
                    >
                      {(customer as any).totalAddresses || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] dark:border-gray-700"
                    >
                      {(customer as any).totalOrders || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "active" ? "default" : "secondary"
                      }
                      className={
                        customer.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {customer.status === "active"
                        ? "Activo"
                        : customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-gray-500">
                    {format(new Date(customer.createdAt), "dd/MM/yy", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/customers/${customer.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  customer.id,
                                );
                                toast.success("ID copiado");
                              } catch {
                                toast.error("Error al copiar");
                              }
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={() => handleDelete(customer.id)}
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

        {/* Pagination bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-xs text-gray-500">
              Página {page} de {data.totalPages} ({data.total} clientes)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
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
