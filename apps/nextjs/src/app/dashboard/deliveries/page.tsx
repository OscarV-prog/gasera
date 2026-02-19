"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";

import { useTRPC } from "~/trpc/react";

export default function DeliveriesPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const api = useTRPC();

  // Mock data - Preservado para demostración
  const mockDeliveries = [
    {
      id: "mock-1",
      orderNumber: "ORD-001",
      customer: "Restaurante El Buen Sabor",
      address: "Av. Reforma 123, Col. Centro",
      driver: "Juan Pérez",
      unit: "ABC-123",
      status: "delivered",
      deliveredAt: "2026-02-13T10:30:00",
      product: "Gas LP 20kg",
      quantity: 5,
    },
    {
      id: "mock-2",
      orderNumber: "ORD-002",
      customer: "Hotel Plaza",
      address: "Calle Juárez 456, Col. Zona Hotelera",
      driver: "María González",
      unit: "XYZ-789",
      status: "in-transit",
      estimatedTime: "2026-02-13T12:00:00",
      product: "Gas LP 30kg",
      quantity: 10,
    },
    {
      id: "mock-3",
      orderNumber: "ORD-003",
      customer: "Taquería Los Compadres",
      address: "Av. Universidad 789, Col. Del Valle",
      driver: "Carlos Rodríguez",
      unit: "DEF-456",
      status: "pending",
      scheduledFor: "2026-02-13T14:00:00",
      product: "Gas LP 20kg",
      quantity: 3,
    },
    {
      id: "mock-4",
      orderNumber: "ORD-004",
      customer: "Panadería La Espiga",
      address: "Calle Morelos 321, Col. Centro",
      driver: "Ana Martínez",
      unit: "GHI-789",
      status: "failed",
      attemptedAt: "2026-02-13T09:00:00",
      product: "Gas LP 20kg",
      quantity: 2,
      failureReason: "Cliente no disponible",
    },
  ];

  // Fetch Real Data
  const { data: realDataResult, isLoading } = useQuery(
    api.orders.listDeliveries.queryOptions({
      status:
        filterStatus === "all"
          ? undefined
          : filterStatus === "in-transit"
            ? "in_progress"
            : filterStatus, // Map 'in-transit' (UI) to 'in_progress' (DB)
      search: searchQuery,
    }),
  );

  // Normalize Real Data
  const realDeliveries =
    realDataResult?.data.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customerName ?? "Cliente Desconocido",
      address: order.customerAddress ?? "Sin dirección",
      driver: order.driverName ?? "Sin asignar",
      unit: order.vehicleUnit ?? "N/A",
      status: order.status === "in_progress" ? "in-transit" : order.status, // Normalize status
      deliveredAt: null, // TODO: map from history if needed
      product: "Gas LP", // Generic placeholder or fetch more details
      quantity: order.itemCount, // Assuming single item type count for summary
      failureReason: null,
    })) ?? [];

  // Filter Mock Data (Client-side)
  const filteredMockDeliveries = mockDeliveries.filter((d) => {
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      d.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Combine Data
  const allDeliveries = [...filteredMockDeliveries, ...realDeliveries];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Entregado
          </span>
        );
      case "in-transit":
      case "in_progress": // Handle DB status
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-400">
            <Truck className="h-3 w-3" />
            En Tránsito
          </span>
        );
      case "pending":
      case "assigned": // Consider assigned as pending for summary or separate? UI has 'pending'
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Fallida
          </span>
        );
      default:
        // Handle cancelled or other statuses
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  // Metrics Calculation (combining both sources for display)
  // Note: For real app, metrics should ideally come from backend Aggregations, but we mix here for demo
  const statsDeliveries = [
    ...mockDeliveries,
    ...(realDataResult?.data ?? []).map((d) => ({
      ...d,
      status: d.status === "in_progress" ? "in-transit" : d.status,
    })),
  ];

  const countDelivered = statsDeliveries.filter(
    (d) => d.status === "delivered",
  ).length;
  const countInTransit = statsDeliveries.filter(
    (d) => d.status === "in-transit" || d.status === "in_progress",
  ).length;
  const countPending = statsDeliveries.filter(
    (d) => d.status === "pending" || d.status === "assigned",
  ).length;
  const countFailed = statsDeliveries.filter(
    (d) => d.status === "failed" || d.status === "cancelled",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Entregas
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Seguimiento y gestión de entregas (Vista Unificada)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Entregadas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {countDelivered}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                En Tránsito
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {countInTransit}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2 dark:bg-yellow-950">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pendientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {countPending}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fallidas/Canc.
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {countFailed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de orden, cliente o dirección..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="delivered">Entregadas</option>
          <option value="in-transit">En Tránsito</option>
          <option value="pending">Pendientes</option>
          <option value="failed">Fallidas</option>
        </select>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Cargando entregas...
          </div>
        ) : allDeliveries.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No se encontraron entregas.
          </div>
        ) : (
          allDeliveries.map((delivery) => (
            <Link
              key={delivery.id}
              href={`/dashboard/deliveries/${delivery.id}`} // Note: Detail page for real orders needs to handle UUIDs
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {delivery.orderNumber}
                    </h3>
                    {getStatusBadge(delivery.status)}
                  </div>
                  <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                    {delivery.customer}
                  </p>
                  <div className="mt-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{delivery.address}</span>
                  </div>
                </div>

                <div className="ml-4 text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Package className="h-4 w-4" />
                    <span>
                      {delivery.quantity}x {delivery.product}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="text-gray-500 dark:text-gray-400">
                      Chofer: {delivery.driver}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Unidad: {delivery.unit}
                    </p>
                  </div>
                </div>
              </div>

              {delivery.status === "failed" && delivery.failureReason && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    Motivo: {delivery.failureReason}
                  </p>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
