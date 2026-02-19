"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Edit,
  FileText,
  Settings,
  Shield,
  Truck,
  Zap,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function UnitDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const api = useTRPC();

  const vehicleQuery = useQuery(
    api.vehicles.get.queryOptions({ id: params.id }),
  );

  if (vehicleQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const v = vehicleQuery.data;

  if (!v) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <p className="text-gray-500">Unidad no encontrada</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-blue-600 dark:text-blue-400"
              >
                DETALLES DE UNIDAD
              </Badge>
              <Badge
                className={
                  v.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : v.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }
              >
                {v.status === "active"
                  ? "Activa"
                  : v.status === "maintenance"
                    ? "Mantenimiento"
                    : "Retirada"}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {v.licensePlate}
            </h1>
          </div>
        </div>

        <Link href={`/dashboard/units/${v.id}/edit`}>
          <Button className="h-11 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            <Edit className="mr-2 h-4 w-4" />
            Editar Información
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info Column */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-blue-500" />
                Información del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Marca
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {v.brand}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Modelo
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {v.model}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Año
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">
                    {v.year || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Tipo
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 capitalize dark:text-gray-100">
                    {v.vehicleType}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    VIN (Serie)
                  </p>
                  <p className="mt-1 font-mono text-gray-900 dark:text-gray-100">
                    {v.vin || "No registrado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                Documentación y Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Registro vence
                  </p>
                  <p className="mt-1 font-medium text-gray-600 dark:text-gray-300">
                    No especificado
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Seguro vence
                  </p>
                  <p className="mt-1 font-medium text-gray-600 dark:text-gray-300">
                    No especificado
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Notas Adicionales
                </p>
                <p className="mt-2 text-sm text-gray-600 italic dark:text-gray-400">
                  {v.notes || "Sin observaciones adicionales registradas."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-8">
          <Card className="underline-none overflow-hidden border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader className="border-none bg-indigo-600">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Zap className="h-5 w-5" />
                Capacidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Peso Máx.
                  </span>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    {v.capacityWeight || 0} kg
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Volumen Máx.
                  </span>
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    {v.capacityVolume || 0} m³
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                  <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="mb-2 text-xs font-bold text-gray-400 uppercase">
                  Combustible
                </p>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm capitalize dark:border-gray-700"
                >
                  {v.fuelType || "diesel"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader className="border-b border-gray-50 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-gray-500" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Registrado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {v.createdAt
                    ? new Date(v.createdAt).toLocaleDateString()
                    : "Desconocido"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Última Actualización
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {v.updatedAt
                    ? new Date(v.updatedAt).toLocaleDateString()
                    : "Nunca"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
