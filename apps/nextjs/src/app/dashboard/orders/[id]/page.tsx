"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  ExternalLink,
  History,
  MapPin,
  Package,
  Plus,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const api = useTRPC();
  const [transitionNotes, setTransitionNotes] = useState("");

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery(api.orders.getById.queryOptions({ id }));

  const transitionMutation = useMutation(
    api.orders.transitionStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Estado actualizado");
        setTransitionNotes("");
        refetch();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Cargando detalles...
      </div>
    );
  if (!order)
    return (
      <div className="p-8 text-center text-red-500">Pedido no encontrado</div>
    );

  const statusColors: Record<string, string> = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
    assigned:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    in_progress:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  };

  const allowedTransitions: Record<string, string[]> = {
    pending: ["assigned", "cancelled"],
    assigned: ["in_progress", "cancelled"],
    in_progress: ["delivered", "failed", "cancelled"],
    failed: ["pending", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  const handleTransition = (newStatus: any) => {
    transitionMutation.mutate({
      orderId: id,
      newStatus,
      notes: transitionNotes || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {order.orderNumber}
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${statusColors[order.status]}`}
              >
                {order.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {order.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">{/* Actions could go here */}</div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-8 lg:col-span-2">
          {/* Order Details Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Items del Pedido
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-800 hover:dark:bg-gray-900/50">
                  <TableHead className="dark:text-gray-400">Producto</TableHead>
                  <TableHead className="text-center dark:text-gray-400">
                    Cant.
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-400">
                    Unitario
                  </TableHead>
                  <TableHead className="text-right dark:text-gray-400">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow
                    key={item.id}
                    className="dark:border-gray-800 hover:dark:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.productType} - {item.productSubtype}
                      </div>
                    </TableCell>
                    <TableCell className="text-center dark:text-gray-300">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right dark:text-gray-300">
                      ${Number(item.unitPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold dark:text-gray-100">
                      $
                      {(
                        item.quantity * Number(item.unitPrice)
                      ).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/30">
              <div className="flex flex-col items-end space-y-1">
                <div className="flex w-48 justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>${Number(order.totalAmount).toLocaleString()}</span>
                </div>
                <div className="flex w-48 justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>IVA (16%):</span>
                  <span>
                    ${(Number(order.totalAmount) * 0.16).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex w-48 justify-between border-t border-gray-200 pt-1 text-lg font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                  <span>Total:</span>
                  <span>
                    ${(Number(order.totalAmount) * 1.16).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Historial y Auditoría
              </h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.history.map((event: any, idx: number) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {idx !== order.history.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900 ${
                                event.newStatus === "delivered"
                                  ? "bg-green-500"
                                  : event.newStatus === "cancelled"
                                    ? "bg-gray-400 dark:bg-gray-600"
                                    : "bg-blue-500"
                              }`}
                            >
                              {event.newStatus === "delivered" ? (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              ) : (
                                <Clock className="h-4 w-4 text-white" />
                              )}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Estado cambiado a{" "}
                                <span className="text-xs font-medium text-gray-900 uppercase dark:text-gray-200">
                                  {event.newStatus.replace("_", " ")}
                                </span>
                                {event.notes && (
                                  <span className="mt-1 block text-gray-400 italic dark:text-gray-500">
                                    "{event.notes}"
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-500">
                              <time dateTime={event.createdAt}>
                                {new Date(event.createdAt).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status Control Card */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="border-b border-gray-100 pb-2 font-bold text-gray-900 dark:border-gray-800 dark:text-white">
              Acciones de Estado
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                  Notas de cambio
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-200 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  rows={2}
                  placeholder="Razón del cambio..."
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {allowedTransitions[order.status]?.map((nextStatus) => (
                  <Button
                    key={nextStatus}
                    onClick={() => handleTransition(nextStatus)}
                    disabled={transitionMutation.isPending}
                    variant={nextStatus === "cancelled" ? "outline" : "default"}
                    className={`justify-start gap-2 capitalize ${
                      nextStatus === "cancelled"
                        ? "text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
                        : ""
                    }`}
                  >
                    {nextStatus === "assigned" ? (
                      <Plus className="h-4 w-4" />
                    ) : nextStatus === "in_progress" ? (
                      <Truck className="h-4 w-4" />
                    ) : nextStatus === "delivered" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : nextStatus === "cancelled" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    Mover a {nextStatus.replace("_", " ")}
                  </Button>
                ))}
                {allowedTransitions[order.status]?.length === 0 && (
                  <p className="rounded-lg bg-gray-50 py-4 text-center text-xs font-medium tracking-widest text-gray-400 uppercase dark:bg-gray-800/50 dark:text-gray-500">
                    Ciclo Finalizado
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="border-b border-gray-100 pb-2 font-bold text-gray-900 dark:border-gray-800 dark:text-white">
              Entrega y Cliente
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Cliente
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {order.customer.businessName || order.customer.customerCode}
                  </p>
                  <Link
                    href={`/dashboard/customers/${order.customer.id}`}
                    className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Ver CRM <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Dirección
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-300">
                    {order.address.street} #{order.address.externalNumber},{" "}
                    {order.address.neighborhood}
                    <br />
                    {order.address.city}, {order.address.state},{" "}
                    {order.address.postalCode}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
                    Fecha Solicitada
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-300">
                    {new Date(order.requestedDate).toLocaleString()}
                  </p>
                  {order.priority === "urgent" && (
                    <span className="mt-1 inline-block animate-pulse rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-red-500">
                      URGENTE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
