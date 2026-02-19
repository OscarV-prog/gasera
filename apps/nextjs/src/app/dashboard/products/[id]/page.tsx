"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Barcode,
  Box,
  CheckCircle,
  Database,
  DollarSign,
  Edit,
  History,
  Info,
  Layers,
  MoreVertical,
  Package,
  Tag,
  Trash2,
} from "lucide-react";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const api = useTRPC();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: product, isLoading } = useQuery(
    api.products.byId.queryOptions({ id }),
  );

  const deleteMutation = useMutation(
    api.products.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Producto eliminado correctamente");
        router.push("/dashboard/products");
      },
      onError: (error) => {
        toast.error(`Error al eliminar: ${error.message}`);
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Package className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Producto no encontrado
        </h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/products")}
        >
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/products"
            className="group mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <Badge
              variant={product.status === "active" ? "default" : "secondary"}
              className={`${
                product.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {product.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/products/${id}/edit`}>
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>

          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará
                  permanentemente el producto
                  <span className="font-bold text-gray-900 dark:text-white">
                    {" "}
                    {product.name}{" "}
                  </span>
                  y lo eliminará de los servidores.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-8 lg:col-span-2">
          {/* Details Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Info className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Información General
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                  Categoría
                </p>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {product.category}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                  Unidad
                </p>
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {product.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                  Descripción
                </p>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {product.description || "Sin descripción disponible."}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50/50 p-6 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Precio e Inventario
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                <p className="mb-1 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                  Precio de Venta
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {Number(product.price).toLocaleString("es-MX", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                <p className="mb-1 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                  Stock Disponible
                </p>
                <div className="flex items-center gap-2">
                  {product.stock !== null ? (
                    <>
                      <p
                        className={`text-2xl font-bold ${Number(product.stock) < 20 ? "text-red-600" : "text-gray-900 dark:text-white"}`}
                      >
                        {product.stock}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.unit}s
                      </span>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-400 italic">
                      No aplica (Servicio)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Meta Info */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h4 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">
              Metadatos
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID del Producto
                </span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {product.id.split("-")[0]}...
                </span>
              </div>
              <Separator className="bg-gray-100 dark:bg-gray-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Creado
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(product.createdAt!).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Última edicion
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(product.updatedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
