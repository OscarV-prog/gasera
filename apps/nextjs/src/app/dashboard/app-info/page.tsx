"use client";

import { Code, FileText, Info, Shield } from "lucide-react";

export default function AppInfoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Información de la Aplicación
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Detalles técnicos y legales del sistema
        </p>
      </div>

      {/* App Info Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Gasera Admin v2.0.1
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sistema de Gestión de Distribución de Gas
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Versión
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              2.0.1
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Última Actualización
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              13 de Febrero, 2026
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Entorno
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Producción
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Base de Datos
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              PostgreSQL 15.2
            </p>
          </div>
        </div>
      </div>

      {/* Changelog */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Historial de Cambios
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="border-l-2 border-blue-600 pl-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                v2.0.1
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                13 Feb 2026
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Modo oscuro implementado</li>
              <li>Nuevo menú de navegación con 15 secciones</li>
              <li>Páginas de Unidades, Programación y Entregas</li>
              <li>Mejoras de rendimiento en dashboard</li>
            </ul>
          </div>

          <div className="border-l-2 border-gray-300 pl-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                v2.0.0
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                1 Feb 2026
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Rediseño completo de la interfaz</li>
              <li>Sistema de autenticación mejorado</li>
              <li>Integración con tRPC</li>
              <li>Optimización de base de datos</li>
            </ul>
          </div>

          <div className="border-l-2 border-gray-300 pl-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                v1.5.0
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                15 Ene 2026
              </span>
            </div>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Módulo de facturación</li>
              <li>Reportes avanzados</li>
              <li>Correcciones de bugs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Documents */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Términos y Condiciones
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Última actualización: 1 de Enero, 2026
          </p>
          <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Ver documento completo →
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Política de Privacidad
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Última actualización: 1 de Enero, 2026
          </p>
          <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Ver documento completo →
          </button>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Stack Tecnológico
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                N
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Next.js 14
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                P
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              PostgreSQL
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                T
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              tRPC
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950">
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                P
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Prisma
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © 2026 Gasera Inc. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
