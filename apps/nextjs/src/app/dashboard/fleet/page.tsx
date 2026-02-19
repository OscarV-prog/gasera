"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Battery,
  ChevronRight,
  Layers,
  Map as MapIcon,
  MoreHorizontal,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Button, Input } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

const FleetMap = dynamic(() => import("~/components/maps/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  ),
});

export default function FleetPage() {
  const api = useTRPC();

  const positionsQuery = useQuery(
    api.tracking.getFleetPositions.queryOptions(undefined, {
      refetchInterval: 10000, // Real-time poll every 10s
    }),
  );

  const vehicles = positionsQuery.data ?? [];
  const isLoading = positionsQuery.isLoading;
  const refetch = positionsQuery.refetch;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving":
        return "bg-emerald-500";
      case "idle":
        return "bg-amber-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Monitor de Flota
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-600/10">
              <Wifi className="h-3 w-3" />
              Sistema en Vivo
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ubicación GPS y telemetría de activos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Vincular Activo
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-4">
        {/* Sidebar - Vehicle List */}
        <div className="flex flex-col space-y-4 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1 dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar unidad..."
              className="pl-9 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                Cargando unidades...
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center sm:py-12">
                <div className="mb-3 rounded-full bg-gray-50 p-3">
                  <Truck className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Sin unidades
                </p>
                <p className="text-xs text-gray-500">
                  No hay vehículos con GPS activo.
                </p>
              </div>
            ) : (
              vehicles.map((v: any) => (
                <div
                  key={v.vehicleId}
                  className="group cursor-pointer rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${getStatusColor(v.status)} ring-opacity-10 ring-4 ring-offset-1`}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                          {v.vehicleName || `Unidad ${v.vehicleId.slice(-4)}`}
                        </p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">
                          {v.status === "moving"
                            ? `${v.speed} km/h`
                            : "Estacionado"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Placeholder */}
        {/* Map Placeholder */}
        <div className="relative h-[600px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm lg:col-span-3 lg:h-auto">
          <FleetMap
            vehicles={
              vehicles?.map((v) => ({
                ...v,
                status: v.status as "active" | "maintenance" | "inactive",
                latitude: v.latitude ? parseFloat(v.latitude) : 0,
                longitude: v.longitude ? parseFloat(v.longitude) : 0,
              })) || []
            }
          />

          <div className="absolute top-4 left-4 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/50 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
              <Layers className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold">Capa: Tráfico Real</span>
            </div>
          </div>

          {/* Floating Vehicle Detail (Optional) */}
          <div className="absolute right-6 bottom-6 left-6 lg:right-6 lg:left-auto lg:w-80">
            <div className="rounded-2xl border border-white/50 bg-white/95 p-5 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
              <div className="mb-4 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Eco-104 (Gasera)
                    </h3>
                    <p className="text-xs text-gray-500">
                      En tránsito a: Sta. Fe
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Batería GPS
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <Battery className="h-4 w-4" />
                    84%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Última Señal
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Navigation className="h-4 w-4" />
                    Hace 2m
                  </div>
                </div>
              </div>

              <Button className="mt-5 w-full bg-gray-900 text-white hover:bg-black">
                Detalles del Viaje
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
