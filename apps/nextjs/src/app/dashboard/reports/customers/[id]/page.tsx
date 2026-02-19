"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  ExternalLink,
  MessageSquare,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function CustomerReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = useTRPC();
  const id = params.id as string;
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const reportQuery = useQuery(
    api.reports.getCustomerReport.queryOptions({ id }),
  );

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation(
    api.reports.updateCustomerReportStatus.mutationOptions({
      onSuccess: async () => {
        toast.success("Estado del reporte actualizado");
        setSelectedStatus(null);
        await queryClient.invalidateQueries(api.reports.pathFilter());
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message}`);
      },
    }),
  );

  if (reportQuery.isLoading) {
    return (
      <div className="p-8 text-center text-lg text-gray-500">
        Cargando detalles del reporte...
      </div>
    );
  }

  const report = reportQuery.data;

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Reporte no encontrado
        </h2>
        <Button onClick={() => router.back()} className="mt-4">
          Volver
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-700">Pendiente</Badge>
        );
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700">En Progreso</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-700">Resuelto</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return (
          <Badge variant="destructive">
            {priority === "urgent" ? "Urgente" : "Alta"}
          </Badge>
        );
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700">Media</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700">Baja</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-600">
                {report.reportNumber}
              </span>
              {getStatusBadge(report.status)}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {report.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedStatus ?? report.status}
            onValueChange={(val) => setSelectedStatus(val)}
          >
            <SelectTrigger className="w-[180px] rounded-xl border-gray-200 font-semibold shadow-sm">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="in-progress">En Progreso</SelectItem>
              <SelectItem value="resolved">Resuelto</SelectItem>
            </SelectContent>
          </Select>
          {selectedStatus && selectedStatus !== report.status && (
            <Button
              onClick={() =>
                updateStatusMutation.mutate({ id, status: selectedStatus })
              }
              disabled={updateStatusMutation.isPending}
              className="rounded-xl bg-blue-600 font-bold shadow-sm"
            >
              {updateStatusMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                  Descripción del Reporte
                </CardTitle>
                {getPriorityBadge(report.priority)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="rounded-xl border border-gray-100 bg-gray-50 p-4 leading-relaxed whitespace-pre-wrap text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {report.description || "Sin descripción proporcionada."}
              </p>
            </CardContent>
          </Card>

          {/* Activity / Timeline (Placeholder) */}
          <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                Historial de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <div className="absolute top-8 h-8 w-0.5 bg-gray-100" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Reporte creado
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(report.createdAt), "PPP", { locale: es })}
                  </p>
                </div>
              </div>

              {report.resolvedAt && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Resuelto exitosamente
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(report.resolvedAt), "PPP", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-500" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  ID Cliente
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {report.customerId}
                  </p>
                </div>
              </div>
              <Separator className="bg-gray-100" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Categoría
                </p>
                <p className="text-sm font-semibold text-gray-900 capitalize dark:text-gray-100">
                  {report.category}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-orange-500" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Creado el
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(report.createdAt), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Última actualización
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(report.updatedAt), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
