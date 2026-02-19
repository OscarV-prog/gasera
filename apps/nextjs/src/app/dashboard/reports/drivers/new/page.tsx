"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ClipboardList,
  MapPin,
  Save,
  Truck,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function NewDriverReportPage() {
  const router = useRouter();
  const api = useTRPC();

  const [formData, setFormData] = useState({
    driverId: "",
    unitId: "",
    issueType: "mechanical",
    location: "",
    description: "",
  });

  // Fetch drivers (fleetDrivers) for selection
  const driversQuery = useQuery(
    api.fleetDrivers.list.queryOptions({
      limit: 100,
    }),
  );

  // Fetch vehicles for selection
  const vehiclesQuery = useQuery(api.vehicles.list.queryOptions());

  const queryClient = useQueryClient();

  const createMutation = useMutation(
    api.reports.createDriverReport.mutationOptions({
      onSuccess: async () => {
        toast.success("¡Reporte de chofer creado con éxito!");
        await queryClient.invalidateQueries(api.reports.pathFilter());
        router.push("/dashboard/reports/drivers");
        router.refresh();
      },
      onError: (error: { message: string }) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.driverId || !formData.issueType) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header with Navigation */}
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
              className="text-orange-600 dark:text-orange-400"
            >
              NUEVO REPORTE DE CHOFER
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Registrar Incidencia de Chofer
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Main Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-orange-500" />
                Personal y Unidad
              </CardTitle>
              <CardDescription>
                Selecciona al chofer y el vehículo involucrado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="driverId"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Chofer *
                </Label>
                <Select
                  value={formData.driverId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, driverId: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar chofer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {driversQuery.data?.data.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="unitId"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Vehículo (Opcional)
                </Label>
                <Select
                  value={formData.unitId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unitId: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar unidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno / Sin vehículo</SelectItem>
                    {vehiclesQuery.data?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="issueType"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Tipo de Incidencia *
                </Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, issueType: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Falla Mecánica</SelectItem>
                    <SelectItem value="accident">Accidente / Choque</SelectItem>
                    <SelectItem value="flat-tire">Ponchadura</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-indigo-500" />
                Detalles del Incidente
              </CardTitle>
              <CardDescription>
                Ubicación y descripción de lo sucedido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Ubicación Aproximada
                </Label>
                <div className="relative">
                  <MapPin className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Ej: Gasolinera km 45, Carretera..."
                    className="rounded-xl border-gray-200 pl-9 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Descripción de lo sucedido
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles de la incidencia..."
                  className="min-h-[150px] rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-12 min-w-[120px] rounded-xl border-gray-200 hover:bg-gray-50 dark:border-gray-800"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="h-12 min-w-[200px] rounded-xl bg-orange-600 font-bold text-white shadow-lg shadow-orange-600/20 transition-transform active:scale-95"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Registrar Incidencia
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
