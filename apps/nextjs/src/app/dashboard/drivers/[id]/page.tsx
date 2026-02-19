"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Clock,
  Edit,
  History,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  User,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function DriverDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const api = useTRPC();

  const driverQuery = useQuery(
    api.fleetDrivers.byId.queryOptions({ id: params.id }),
  );

  if (driverQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const driver = driverQuery.data;

  if (!driver) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Chofer no encontrado</h2>
        <Button onClick={() => router.push("/dashboard/drivers")}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header & Actions */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
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
                PERFIL DEL CHOFER
              </Badge>
              <Badge
                className={
                  driver.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }
              >
                {driver.status === "active" ? "Disponible" : "Desconectado"}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {driver.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/drivers/${driver.id}/edit`}>
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 dark:border-gray-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </Link>
          <Button className="rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            Nueva Asignación
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Quick Info & Stats */}
        <div className="space-y-8">
          {/* Card Principal */}
          <Card className="overflow-hidden border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <div className="h-24 bg-linear-to-r from-blue-600 to-indigo-600" />
            <div className="relative mt-[-48px] px-6 pb-6">
              <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-1 text-4xl shadow-xl dark:bg-gray-950">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-900">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Información de Contacto
                  </p>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{driver.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{driver.phone}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="mb-2 text-sm font-medium text-gray-500">
                    Licencia
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="font-mono text-sm dark:border-gray-700"
                    >
                      {driver.licenseNumber}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      Vigente
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="pt-6 text-center">
                <Truck className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                <p className="text-2xl font-bold">
                  {driver.totalDeliveries || 0}
                </p>
                <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Entregas
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="pt-6 text-center">
                <Star className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                <p className="text-2xl font-bold">
                  {Number(driver.rating || 0).toFixed(1)}
                </p>
                <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Rating
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Detailed Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
              <TabsTrigger value="overview" className="rounded-lg">
                Vista General
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg">
                Historial
              </TabsTrigger>
              <TabsTrigger value="unit" className="rounded-lg">
                Unidad Asignada
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6">
                <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                      Estatus del Servicio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold">Última Ubicación</p>
                          <p className="text-sm text-gray-500">
                            {driver.currentLocation || "Ubicación desconocida"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Hace 5 min</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-semibold">Siguiente Entrega</p>
                          <p className="text-sm text-gray-500">
                            Sin rutas asignadas
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        Ver Mapa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-orange-500" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <History className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      No hay actividad registrada en los últimos 7 días.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unit">
              <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="h-5 w-5 text-blue-500" />
                    Vehículo Asignado
                  </CardTitle>
                  <CardDescription>
                    Detalles técnicos de la unidad del chofer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {driver.assignedUnitId ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 rounded-2xl border border-blue-100 bg-blue-50/30 p-6 dark:border-blue-900/20 dark:bg-blue-900/10">
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                          <Truck className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            Unidad {driver.assignedUnitId}
                          </h3>
                          <p className="text-gray-500">
                            ID del Sistema: {driver.assignedUnitId}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                          <p className="mb-1 text-xs font-bold text-gray-400 uppercase">
                            Estatus
                          </p>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            En Operación
                          </Badge>
                        </div>
                        <div className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                          <p className="mb-1 text-xs font-bold text-gray-400 uppercase">
                            Mantenimiento
                          </p>
                          <p className="text-sm font-semibold">
                            Al día (hace 12 días)
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <Truck className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="mb-4 text-gray-500">
                        No hay ninguna unidad asignada a este chofer.
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-xl border-blue-200 text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        Asignar una Unidad
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
