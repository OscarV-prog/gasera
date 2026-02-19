"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, FileText, Save, Truck, Zap } from "lucide-react";

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
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function EditUnitPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const api = useTRPC();

  const [formData, setFormData] = useState({
    licensePlate: "",
    vehicleType: "truck" as "truck" | "van" | "pickup" | "motorcycle",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    capacityWeight: 0,
    capacityVolume: 0,
    fuelType: "diesel" as "gasoline" | "diesel" | "electric" | "hybrid",
    status: "active" as "active" | "maintenance" | "retired",
    notes: "",
  });

  const vehicleQuery = useQuery(
    api.vehicles.get.queryOptions({ id: params.id }),
  );

  useEffect(() => {
    if (vehicleQuery.data) {
      const v = vehicleQuery.data;
      setFormData({
        licensePlate: v.licensePlate || "",
        vehicleType: (v.vehicleType as any) || "truck",
        brand: v.brand || "",
        model: v.model || "",
        year: v.year || new Date().getFullYear(),
        vin: v.vin || "",
        capacityWeight: Number(v.capacityWeight) || 0,
        capacityVolume: Number(v.capacityVolume) || 0,
        fuelType: (v.fuelType as any) || "diesel",
        status: (v.status as any) || "active",
        notes: v.notes || "",
      });
    }
  }, [vehicleQuery.data]);

  const updateMutation = useMutation(
    api.vehicles.update.mutationOptions({
      onSuccess: () => {
        toast.success("¡Vehículo actualizado con éxito!");
        router.push("/dashboard/units");
        router.refresh();
      },
      onError: (error: { message: string }) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.licensePlate ||
      !formData.brand ||
      !formData.model ||
      !formData.vehicleType
    ) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    updateMutation.mutate({
      id: params.id,
      ...formData,
      year: Number(formData.year),
      capacityWeight: Number(formData.capacityWeight),
      capacityVolume: Number(formData.capacityVolume),
    });
  };

  if (vehicleQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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
              className="text-indigo-600 dark:text-indigo-400"
            >
              EDITAR UNIDAD
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {formData.licensePlate || "Cargando..."}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Basic Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-blue-500" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Identificación y tipo de vehículo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Estatus
                </Label>
                <select
                  id="status"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="active">Activa</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="retired">Retirada</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="licensePlate"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Placas *
                </Label>
                <Input
                  id="licensePlate"
                  placeholder="ABC-1234"
                  className="rounded-xl border-gray-200 py-6 font-mono uppercase dark:border-gray-700 dark:bg-gray-800"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="vehicleType"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Tipo de Vehículo *
                </Label>
                <select
                  id="vehicleType"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  value={formData.vehicleType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as any,
                    })
                  }
                >
                  <option value="truck">Camión (Truck)</option>
                  <option value="van">Camioneta (Van)</option>
                  <option value="pickup">Pickup</option>
                  <option value="motorcycle">Motocicleta</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="brand"
                    className="text-xs font-bold text-gray-400 uppercase"
                  >
                    Marca *
                  </Label>
                  <Input
                    id="brand"
                    placeholder="Toyota"
                    className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="model"
                    className="text-xs font-bold text-gray-400 uppercase"
                  >
                    Modelo *
                  </Label>
                  <Input
                    id="model"
                    placeholder="Hilux"
                    className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-indigo-500" />
                Especificaciones Técnicas
              </CardTitle>
              <CardDescription>Capacidades y combustible</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="year"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Año
                </Label>
                <Input
                  id="year"
                  type="number"
                  className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fuelType"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Tipo de Combustible
                </Label>
                <select
                  id="fuelType"
                  className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  value={formData.fuelType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fuelType: e.target.value as any,
                    })
                  }
                >
                  <option value="diesel">Diesel</option>
                  <option value="gasoline">Gasolina</option>
                  <option value="electric">Eléctrico</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="capacityWeight"
                    className="text-xs font-bold text-gray-400 uppercase"
                  >
                    Carga (kg)
                  </Label>
                  <Input
                    id="capacityWeight"
                    type="number"
                    placeholder="2500"
                    className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.capacityWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacityWeight: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="capacityVolume"
                    className="text-xs font-bold text-gray-400 uppercase"
                  >
                    Volumen (m³)
                  </Label>
                  <Input
                    id="capacityVolume"
                    type="number"
                    placeholder="15"
                    className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.capacityVolume}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacityVolume: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="vin"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Número de Serie (VIN)
                </Label>
                <Input
                  id="vin"
                  placeholder="17 caracteres..."
                  className="rounded-xl border-gray-200 font-mono dark:border-gray-700 dark:bg-gray-800"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({ ...formData, vin: e.target.value })
                  }
                  maxLength={17}
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
            disabled={updateMutation.isPending}
            className="h-12 min-w-[200px] rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:bg-indigo-700 active:scale-95"
          >
            {updateMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
