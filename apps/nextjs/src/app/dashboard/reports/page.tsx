"use client";

import { BarChart3, FileText, TrendingUp, Users } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Reportes Generales
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Análisis y reportes del sistema
        </p>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Reportes de Clientes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Análisis de clientes y ventas
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Reportes de Choferes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Desempeño y métricas
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Reportes Financieros
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ingresos y facturación
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Reportes Operacionales
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entregas y rutas
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Reportes de Inventario
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stock y productos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Resumen del Mes
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ventas Totales
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              $125,450
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +12% vs mes anterior
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pedidos Completados
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              342
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +8% vs mes anterior
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clientes Activos
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              156
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +5% vs mes anterior
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tasa de Entrega
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              98.5%
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              +2% vs mes anterior
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
