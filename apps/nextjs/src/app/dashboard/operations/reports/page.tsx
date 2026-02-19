"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  FileDown,
  PieChart,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

import { Button } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function ReportsPage() {
  const api = useTRPC();

  const { data: reportTypes } = useQuery(
    api.operations.getReportTypes.queryOptions(),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Inteligencia de Negocio
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis de ventas, rendimiento de flota y métricas operativas.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            Últimos 30 días
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <RefreshCcw className="h-4 w-4" />
            Refrescar Datos
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value="$1.24M"
          change="+12%"
          positive
        />
        <MetricCard
          title="Efectividad Entrega"
          value="98.4%"
          change="+0.5%"
          positive
        />
        <MetricCard
          title="Cilindros Rotados"
          value="4,200"
          change="-2.1%"
          positive={false}
        />
        <MetricCard
          title="Ticket Promedio"
          value="$295"
          change="+5%"
          positive
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">
              Catálogo de Reportes
            </h3>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="space-y-3">
            {reportTypes?.map((report) => (
              <div
                key={report.id}
                className="group flex items-center justify-between rounded-xl border border-gray-50 p-4 transition-colors hover:bg-gray-50"
              >
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {report.name}
                  </h4>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">
                Ventas por Producto
              </h3>
              <PieChart className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="h-32 w-32 rotate-45 rounded-full border-[12px] border-indigo-600 border-r-orange-500 border-b-emerald-500"></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <LegendItem label="LP 20kg" value="45%" color="bg-indigo-600" />
              <LegendItem label="LP 30kg" value="30%" color="bg-orange-500" />
              <LegendItem label="Otros" value="25%" color="bg-emerald-500" />
            </div>
          </div>

          <div className="relative flex-1 rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                Volumen de Entrega
              </h3>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mb-4 flex h-24 items-end gap-1">
              {[40, 60, 45, 70, 85, 60, 90, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-indigo-500/50"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
              <span>Lunes</span>
              <span>Hoy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-1 text-[10px] font-black tracking-widest text-gray-400 uppercase">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        <span
          className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-bold ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
        >
          <ArrowUpRight className={`h-3 w-3 ${!positive && "rotate-90"}`} />
          {change}
        </span>
      </div>
    </div>
  );
}

function LegendItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className={`h-1 w-full rounded-full ${color}`}></div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-black text-gray-900">{value}</p>
    </div>
  );
}
