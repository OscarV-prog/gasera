"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Database,
  DollarSign,
  Layers,
  Package,
  Tag,
} from "lucide-react";

import { Badge, Button, Input, Label, Separator, toast } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function NewProductPage() {
  const api = useTRPC();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "gas-lp" as
      | "gas-lp"
      | "gas-estacionario"
      | "servicios"
      | "accesorios"
      | "otro",
    price: 0,
    stock: undefined as number | undefined,
    unit: "cilindro",
  });

  const createMutation = useMutation(
    api.products.create.mutationOptions({
      onSuccess: () => {
        toast.success("¡Producto creado con éxito!");
        router.push("/dashboard/products");
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="group flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:border-blue-500 hover:text-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <Badge
              variant="outline"
              className="text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400"
            >
              Catálogo
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Nuevo Producto o Servicio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Añade un nuevo ítem a tu catálogo de ventas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 transition-all dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="hidden border-r border-gray-100 bg-gray-50/50 p-6 md:col-span-3 md:block dark:border-gray-800 dark:bg-gray-800/30">
              <nav className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <Package className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Detalles
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Precio
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                  <Database className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Inventario
                  </span>
                </div>
              </nav>
            </div>

            <div className="p-6 md:col-span-9 lg:p-10">
              <div className="space-y-8">
                {/* Section 1: Basic Details */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <Tag className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Información del Producto
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label
                        htmlFor="name"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Nombre del Producto *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Ej. Gas LP 20kg, Mantenimiento, Filtro..."
                        className="rounded-xl border-gray-200 bg-gray-50/50 py-6 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Categoría *
                      </Label>
                      <div className="relative">
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value as any,
                            })
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                          required
                        >
                          <option value="gas-lp">Gas LP</option>
                          <option value="gas-estacionario">
                            Gas Estacionario
                          </option>
                          <option value="servicios">Servicios</option>
                          <option value="accesorios">Accesorios</option>
                          <option value="otro">Otro</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <ChevronLeft className="h-4 w-4 -rotate-90 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="unit"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Unidad de Medida *
                      </Label>
                      <Input
                        id="unit"
                        placeholder="Ej. cilindro, litro, servicio, pieza"
                        className="rounded-xl border-gray-200 bg-gray-50/50 py-6 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label
                        htmlFor="description"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Descripción
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Describe las características del producto o detalles del servicio..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                      />
                    </div>
                  </div>
                </section>

                <Separator className="bg-gray-100 dark:bg-gray-800" />

                {/* Section 2: Pricing & Inventory */}
                <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Precio e Inventario
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Precio de Venta *
                      </Label>
                      <div className="relative">
                        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          $
                        </span>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="rounded-xl border-gray-200 bg-gray-50/50 py-6 pl-10 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="stock"
                        className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400"
                      >
                        Stock Inicial (Opcional)
                      </Label>
                      <div className="relative">
                        <Layers className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="stock"
                          type="number"
                          placeholder="0"
                          className="rounded-xl border-gray-200 bg-gray-50/50 py-6 pl-11 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:ring-blue-900/30"
                          value={
                            formData.stock === undefined ? "" : formData.stock
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock:
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic">
                        Dejar vacío si es un servicio
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col-reverse gap-4 border-t border-gray-100 pt-8 sm:flex-row sm:justify-end dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 min-w-[120px] rounded-xl border-gray-200 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-12 min-w-[200px] rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Guardar Producto
                    </span>
                  )}
                </Button>
              </div>

              {createMutation.error && (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>Error: {createMutation.error.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
