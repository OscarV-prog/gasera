"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const api = useTRPC();

  const isMock = id.startsWith("mock-");

  // Mock Data (Duplicated from list page for demo consistency)
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
      total: "$2,500.00",
      phone: "555-123-4567",
      paymentMethod: "Efectivo",
      timeline: [
        {
          status: "created",
          date: "2026-02-13T09:00:00",
          note: "Pedido realizado",
        },
        {
          status: "assigned",
          date: "2026-02-13T09:15:00",
          note: "Chofer asignado",
        },
        {
          status: "in-transit",
          date: "2026-02-13T09:45:00",
          note: "En camino",
        },
        {
          status: "delivered",
          date: "2026-02-13T10:30:00",
          note: "Entregado con éxito",
        },
      ],
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
      total: "$6,000.00",
      phone: "555-987-6543",
      paymentMethod: "Crédito",
      timeline: [
        {
          status: "created",
          date: "2026-02-13T10:00:00",
          note: "Pedido realizado",
        },
        {
          status: "assigned",
          date: "2026-02-13T10:30:00",
          note: "Chofer asignado",
        },
        {
          status: "in-transit",
          date: "2026-02-13T11:00:00",
          note: "En camino",
        },
      ],
    },
  ];

  const mockData = mockDeliveries.find((d) => d.id === id);

  // Real Data Fetch - Order
  const { data: orderData, isLoading: isLoadingOrder } = useQuery(
    api.orders.getById.queryOptions({ id }, { enabled: !isMock }),
  );

  // Real Data Fetch - Related Driver
  const { data: driverData } = useQuery(
    api.fleetDrivers.byId.queryOptions(
      { id: orderData?.assignedDriverId ?? "" },
      { enabled: !!orderData?.assignedDriverId },
    ),
  );

  // Real Data Fetch - Related Vehicle
  const { data: vehicleData } = useQuery(
    api.vehicles.get.queryOptions(
      { id: orderData?.assignedVehicleId ?? "" },
      { enabled: !!orderData?.assignedVehicleId },
    ),
  );

  if (isMock && !mockData) {
    return <div>Entrega no encontrada (Mock ID inválido)</div>;
  }

  if (!isMock && isLoadingOrder) {
    return (
      <div className="p-8 text-center">Cargando detalles de la entrega...</div>
    );
  }

  if (!isMock && !orderData) {
    return <div>Entrega no encontrada</div>;
  }

  // Normalize Data
  const delivery = isMock
    ? {
        ...mockData!,
        customerName: mockData!.customer,
        items: [
          {
            productName: mockData!.product,
            quantity: mockData!.quantity,
            unitPrice: 500, // Mock price
            lineTotal: mockData!.total,
          },
        ],
        history: mockData!.timeline.map((t) => ({
          status: t.status,
          createdAt: new Date(t.date),
          notes: t.note,
        })),
        driverName: mockData!.driver,
        unitCode: mockData!.unit,
      }
    : {
        id: orderData!.id,
        orderNumber: orderData!.orderNumber,
        status: orderData!.status,
        deliveredAt: null,
        customerName: orderData!.customer.businessName,
        address: `${orderData!.address.street} ${orderData!.address.externalNumber}, ${orderData!.address.neighborhood}`,
        phone: "N/A",
        driverName: driverData?.name ?? "Sin asignar",
        unitCode: vehicleData?.licensePlate ?? "N/A",
        total: `$${orderData!.totalAmount.toFixed(2)}`,
        paymentMethod: "N/A",
        items: orderData!.items,
        history: orderData!.history,
      };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    "in-transit": "bg-blue-100 text-blue-800 border-blue-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "Pendiente",
      assigned: "Asignado",
      in_progress: "En Camino",
      "in-transit": "En Camino",
      delivered: "Entregado",
      cancelled: "Cancelado",
      failed: "Fallido",
    };
    return map[status] ?? status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Entrega {delivery.orderNumber}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{format(new Date(), "PPP", { locale: es })}</span>
          </div>
        </div>
        <div className="ml-auto">
          <Badge
            variant="outline"
            className={`${statusColors[delivery.status as keyof typeof statusColors]} border px-3 py-1 text-sm font-medium`}
          >
            {getStatusLabel(delivery.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {/* Customer & Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-gray-400" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {delivery.customerName}
                </p>
                <div className="mt-1 flex items-start gap-2 text-sm text-gray-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{delivery.address}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>{delivery.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-5 w-5 text-gray-400" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Chofer Asignado</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {delivery.driverName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unidad</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {delivery.unitCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-5 w-5 text-gray-400" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {delivery.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ${item.lineTotal?.toLocaleString() ?? "0.00"}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-gray-100">
                  <span>Total</span>
                  <span>{delivery.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-gray-400" />
                Historial de Estatus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 pl-6 before:absolute before:top-2 before:left-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
                {delivery.history.map((event: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute top-1 -left-[29px] h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-50 dark:border-gray-950 dark:bg-blue-500 dark:ring-blue-900/20" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getStatusLabel(event.status || event.newStatus)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(event.createdAt || event.date),
                          "PPP p",
                          { locale: es },
                        )}
                      </p>
                      {event.notes && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
