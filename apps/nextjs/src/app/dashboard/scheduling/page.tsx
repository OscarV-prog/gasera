"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Truck, User } from "lucide-react";

import { Button } from "@acme/ui";

export default function SchedulingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - esto se reemplazará con datos reales de tRPC
  const schedules = [
    {
      id: "1",
      time: "08:00",
      driver: "Juan Pérez",
      unit: "ABC-123",
      route: "Ruta Norte",
      deliveries: 5,
      status: "scheduled",
    },
    {
      id: "2",
      time: "09:30",
      driver: "María González",
      unit: "XYZ-789",
      route: "Ruta Centro",
      deliveries: 8,
      status: "in-progress",
    },
    {
      id: "3",
      time: "11:00",
      driver: "Carlos Rodríguez",
      unit: "DEF-456",
      route: "Ruta Sur",
      deliveries: 6,
      status: "scheduled",
    },
    {
      id: "4",
      time: "14:00",
      driver: "Ana Martínez",
      unit: "GHI-789",
      route: "Ruta Este",
      deliveries: 4,
      status: "scheduled",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Programación del Día
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Calendario y asignación de rutas diarias
        </p>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="border-none bg-transparent text-sm focus:outline-none dark:text-gray-100"
          />
        </div>
        <Button variant="outline">Hoy</Button>
        <Button variant="outline">Mañana</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rutas Programadas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {schedules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
              <User className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choferes Activos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {schedules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entregas Totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {schedules.reduce((acc, s) => acc + s.deliveries, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-950">
              <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                En Progreso
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {schedules.filter((s) => s.status === "in-progress").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Programación del Día
        </h2>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center gap-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Hora
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {schedule.time}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {schedule.route}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      schedule.status === "in-progress"
                        ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {schedule.status === "in-progress"
                      ? "En Progreso"
                      : "Programada"}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {schedule.driver}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {schedule.unit}
                  </span>
                  <span>{schedule.deliveries} entregas</span>
                </div>
              </div>

              <Button variant="outline" size="sm">
                Ver Detalles
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
