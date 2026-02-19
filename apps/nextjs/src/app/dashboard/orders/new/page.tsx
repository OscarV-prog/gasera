"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  MapPin,
  Package,
  Plus,
  Save,
  Search,
  Trash2,
  User,
} from "lucide-react";

import { Button, Input, Label, toast } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

const PRIORITY_MAP: Record<string, number> = {
  low: 1,
  normal: 2,
  high: 3,
  urgent: 5,
};

export default function NewOrderPage() {
  const api = useTRPC();
  const router = useRouter();

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [addressId, setAddressId] = useState("");
  const [requestedDate, setRequestedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [requestedTime, setRequestedTime] = useState("12:00");
  const [priority, setPriority] = useState<
    "low" | "normal" | "high" | "urgent"
  >("normal");
  const [items, setItems] = useState<any[]>([
    {
      productType: "cylinder",
      productSubtype: "20kg",
      productName: "Cilindro 20kg",
      quantity: 1,
      unitPrice: 550,
    },
  ]);
  const [customerNotes, setCustomerNotes] = useState("");

  // Queries
  const customersQuery = useQuery(
    api.customers.list.queryOptions({ limit: 100 }),
  );
  const customersData = customersQuery.data;

  const addressesQuery = useQuery(
    api.customers.listAddresses.queryOptions(
      { customerId },
      { enabled: !!customerId },
    ),
  );
  const addressesData = addressesQuery.data;

  // Auto-select first address when customer changes
  useEffect(() => {
    if (addressesData && addressesData.length > 0) {
      setAddressId(addressesData[0]?.id ?? "");
    } else {
      setAddressId("");
    }
  }, [addressesData]);

  const createMutation = useMutation(
    api.orders.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Pedido creado exitosamente");
        router.push(`/dashboard/orders/${data.id}`);
      },
      onError: (err) => {
        toast.error(`Error al crear pedido: ${err.message}`);
      },
    }),
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        productType: "cylinder",
        productSubtype: "20kg",
        productName: "Cilindro 20kg",
        quantity: 1,
        unitPrice: 550,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !addressId || items.length === 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    createMutation.mutate({
      customerId,
      addressId,
      requestedDeliveryDate: new Date(requestedDate),
      requestedDeliveryTime: requestedTime,
      priority: priority,
      items: items.map((item) => ({
        itemType: item.productType,
        itemModel: item.productSubtype,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      customerNotes,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Nuevo Pedido
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Registrar una nueva orden de servicio o producto.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* Left Column: Customer & Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <User className="h-5 w-5 text-blue-600" />
              Información del Cliente
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                  <select
                    id="customer"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar cliente...</option>
                    {customersData?.data.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName || `${c.email}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección de Entrega *</Label>
                <div className="relative">
                  <MapPin className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                  <select
                    id="address"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                    required
                    disabled={!customerId}
                  >
                    <option value="">
                      {customerId
                        ? "Seleccionar dirección..."
                        : "Selecciona un cliente primero"}
                    </option>
                    {addressesData?.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nickname || `${a.street} ${a.externalNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Entrega *</Label>
                <Input
                  id="date"
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora Sugerida</Label>
                <Input
                  id="time"
                  type="time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas del Cliente / Instrucciones</Label>
              <textarea
                id="notes"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                rows={3}
                placeholder="Ejem: Portería blanca, llamar al llegar..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Package className="h-5 w-5 text-blue-600" />
                Productos y Cantidades
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Plus className="h-4 w-4" />
                Añadir Producto
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="group relative grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="sm:col-span-2">
                    <Label className="mb-1.5 text-xs">Producto</Label>
                    <select
                      className="block w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                      value={item.productSubtype}
                      onChange={(e) =>
                        updateItem(index, "productSubtype", e.target.value)
                      }
                    >
                      <option value="10kg">Cilindro 10kg</option>
                      <option value="20kg">Cilindro 20kg</option>
                      <option value="30kg">Cilindro 30kg</option>
                      <option value="45kg">Cilindro 45kg</option>
                      <option value="stationary">
                        Gas Estacionario (Litros)
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">Precio Unit.</Label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", e.target.value)
                      }
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:bg-red-900/40 dark:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100">
              Resumen de Orden
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${calculateSubtotal().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  IVA (16%)
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  ${(calculateSubtotal() * 0.16).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ${(calculateSubtotal() * 1.16).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="priority">Prioridad de Entrega</Label>
              <select
                id="priority"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="low">Baja (48h)</option>
                <option value="normal">Normal (24h)</option>
                <option value="high">Alta (Hoy)</option>
                <option value="urgent">Urgente (Flash)</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                "Registrando..."
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Confirmar Pedido
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
