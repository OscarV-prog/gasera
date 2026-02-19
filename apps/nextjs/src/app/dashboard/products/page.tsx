"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Loader2, Package, Plus, Search } from "lucide-react";

import { Badge, Button, Input } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function ProductsPage() {
  const api = useTRPC();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: productsData, isLoading } = useQuery(
    api.products.list.queryOptions({
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      limit: 100,
    }),
  );

  const products = productsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Productos
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Catálogo centralizado de productos y servicios de Gasera.
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="h-11 gap-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Productos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isLoading ? "..." : (productsData?.total ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Categorías
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(products.map((p) => p.category)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Productos Activos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {products.filter((p) => p.status === "active").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos por nombre..."
            className="h-12 rounded-xl border-gray-100 bg-white pl-11 shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-12 rounded-xl border border-gray-100 bg-white px-4 text-sm font-medium text-gray-600 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          <option value="gas-lp">Gas LP</option>
          <option value="gas-estacionario">Gas Estacionario</option>
          <option value="servicios">Servicios</option>
          <option value="accesorios">Accesorios</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  No se encontraron productos
                </p>
                <p className="text-sm text-gray-500">
                  Intenta cambiar los filtros o añadir uno nuevo.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-50 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm transition-transform group-hover:scale-110 dark:border-gray-700 dark:bg-gray-800">
                          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="mb-1 leading-none font-bold text-gray-900 dark:text-gray-100">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Por {product.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="rounded-lg border-gray-200 font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400"
                      >
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold whitespace-nowrap text-gray-900 dark:text-gray-100">
                      $
                      {Number(product.price).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap">
                      {product.stock !== null ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${Number(product.stock) < 20 ? "animate-pulse bg-red-500" : "bg-green-500"}`}
                          />
                          <span
                            className={
                              Number(product.stock) < 20
                                ? "font-bold text-red-600"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          >
                            {product.stock} {product.unit}s
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">
                          No aplica (Servicio)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {product.status === "active"
                          ? "● Activo"
                          : "○ Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-sm whitespace-nowrap">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
