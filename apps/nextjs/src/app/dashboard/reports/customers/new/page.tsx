"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronLeft,
  MessageSquare,
  Save,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function NewCustomerReportPage() {
  const router = useRouter();
  const api = useTRPC();

  const [formData, setFormData] = useState({
    customerId: "",
    category: "service",
    subject: "",
    description: "",
    priority: "medium",
  });

  // Fetch customers for the selection
  const customersQuery = useQuery(
    api.customers.list.queryOptions({
      limit: 100,
    }),
  );

  const queryClient = useQueryClient();

  const createMutation = useMutation(
    api.reports.createCustomerReport.mutationOptions({
      onSuccess: async () => {
        toast.success("¡Reporte de cliente creado con éxito!");
        await queryClient.invalidateQueries(api.reports.pathFilter());
        router.push("/dashboard/reports/customers");
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
      !formData.customerId ||
      !formData.subject ||
      !formData.category ||
      !formData.priority
    ) {
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
              className="text-blue-600 dark:text-blue-400"
            >
              NUEVO REPORTE
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Crear Reporte de Cliente
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Main Info */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-500" />
                Información del Cliente
              </CardTitle>
              <CardDescription>
                Selecciona el cliente y la categoría del reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customerId"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Cliente *
                </Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersQuery.data?.data.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.tradeName ||
                          customer.businessName ||
                          customer.customerCode}
                      </SelectItem>
                    ))}
                    {customersQuery.data?.data.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Categoría *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="product">Producto</SelectItem>
                    <SelectItem value="service">Servicio</SelectItem>
                    <SelectItem value="billing">Facturación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Prioridad *
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                    <SelectValue placeholder="Seleccionar prioridad..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                Detalles del Reporte
              </CardTitle>
              <CardDescription>
                Descripción del problema o solicitud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Asunto *
                </Label>
                <Input
                  id="subject"
                  placeholder="Ej: Retraso en entrega"
                  className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-xs font-bold text-gray-400 uppercase"
                >
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe los detalles del reporte..."
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
            className="h-12 min-w-[200px] rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Crear Reporte
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
