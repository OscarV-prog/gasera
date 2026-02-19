"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronLeft,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Save,
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
  Input,
  Label,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function NewDriverPage() {
  const router = useRouter();
  const api = useTRPC();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    assignedUnitId: "",
  });

  const vehiclesQuery = useQuery(api.vehicles.list.queryOptions());

  const createMutation = useMutation(
    api.fleetDrivers.create.mutationOptions({
      onSuccess: () => {
        toast.success("¡Chofer registrado con éxito!");
        router.push("/dashboard/drivers");
      },
      onError: (error: any) => {
        toast.error(`Error al registrar chofer: ${error.message}`);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.licenseNumber
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    createMutation.mutate({
      ...formData,
      assignedUnitId: formData.assignedUnitId || undefined,
    });
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
              className="text-blue-600 dark:text-blue-400"
            >
              LOGÍSTICA
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Nuevo Chofer
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Personal Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-500" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Datos básicos de contacto del chofer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Nombre Completo *
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Ej. Juan Manuel Pérez"
                    className="rounded-xl border-gray-200 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Correo Electrónico *
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="chofer@ejemplo.com"
                    className="rounded-xl border-gray-200 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Teléfono *
                </Label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="669 123 4567"
                    className="rounded-xl border-gray-200 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-indigo-500" />
                Operaciones
              </CardTitle>
              <CardDescription>Detalles de licencia y unidad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="license"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Número de Licencia *
                </Label>
                <div className="relative">
                  <FileText className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="license"
                    placeholder="LICENSE-001"
                    className="rounded-xl border-gray-200 py-6 pl-10 font-mono dark:border-gray-700 dark:bg-gray-800"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="unit"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Unidad Asignada
                </Label>
                <div className="relative">
                  <Truck className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    id="unit"
                    className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-10 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                    value={formData.assignedUnitId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedUnitId: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar unidad...</option>
                    {vehiclesQuery.data?.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-gray-400">
                  Puedes asignar una unidad después si lo prefieres.
                </p>
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
            className="h-12 min-w-[200px] rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Registrar Chofer
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
