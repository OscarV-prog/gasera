"use client";

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
  MapPin,
  MessageSquare,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function DriverReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const api = useTRPC();
  const id = params.id as string;

  const reportQuery = useQuery(
    api.reports.getDriverReport.queryOptions({ id }),
  );

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation(
    api.reports.updateDriverReportStatus.mutationOptions({
      onSuccess: async () => {
        toast.success("Estado del reporte actualizado");
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
              <span className="font-mono text-sm font-bold text-orange-600">
                {report.reportNumber}
              </span>
              {getStatusBadge(report.status)}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {report.issueType}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={report.status}
            onValueChange={(val) =>
              updateStatusMutation.mutate({ id, status: val })
            }
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="border-gray-200 shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-indigo-500" />
                Descripción de la Incidencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {report.description || "Sin descripción proporcionada."}
                </p>
              </div>

              {report.location && (
                <div className="mt-6 flex items-start gap-3 border-t pt-4 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 text-red-500" />
                  <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase">
                      Ubicación
                    </span>
                    {report.location}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                Línea de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                  1
                  <div className="absolute top-8 h-8 w-0.5 bg-gray-100" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Reporte registrado
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(report.createdAt), "PPP p", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>

              {report.status !== "pending" && (
                <div className="flex gap-4">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Actualizado a: {report.status}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(report.updatedAt), "PPP p", {
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
                Chofer y Unidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Chofer
                </p>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                  {report.driverId}
                </p>
              </div>
              <Separator className="bg-gray-100" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Unidad
                </p>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {report.unitId || "Sin unidad asignada"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-emerald-500" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Tipo de Incidencia
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {report.issueType}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Último Cambio
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {format(new Date(report.updatedAt), "d 'de' MMM, HH:mm", {
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
