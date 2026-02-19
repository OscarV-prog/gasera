"use client";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Truck,
  User,
} from "lucide-react";
import { createPortal } from "react-dom";

import { Button, toast } from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function DispatchPage() {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery(
    api.orders.list.queryOptions({ limit: 100 }),
  );

  const { mutate: transitionStatus } = useMutation(
    api.orders.transitionStatus.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: api.orders.list.queryKey(),
        });
        toast.success("Estado actualizado");
      },
      onError: (err) => {
        toast.error(`Error al actualizar: ${err.message}`);
      },
    }),
  );

  const columns = [
    {
      id: "pending",
      title: "Pendientes",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: "bg-amber-500",
    },
    {
      id: "assigned",
      title: "Asignados",
      icon: <User className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-500",
    },
    {
      id: "in_progress",
      title: "En Ruta",
      icon: <Truck className="h-4 w-4 text-indigo-500" />,
      color: "bg-indigo-500",
    },
    {
      id: "delivered",
      title: "Completados",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      color: "bg-green-500",
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const getOrdersByStatus = (status: string) => {
    return orders?.data.filter((o) => o.status === status) ?? [];
  };

  const activeOrder = useMemo(
    () => orders?.data.find((o) => o.id === activeId),
    [orders, activeId],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const orderId = active.id as string;
      const newStatus = over.id as string;

      // Optimistic update check (prevent same status drop)
      const currentOrder = orders?.data.find((o) => o.id === orderId);
      if (currentOrder && currentOrder.status !== newStatus) {
        transitionStatus({
          orderId,
          newStatus: newStatus as any,
        });
      }
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Dispatcher (Kanban)
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gestión visual del flujo de pedidos y flota.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por Vehículo
            </Button>
            <Link href="/dashboard/orders/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="flex h-full min-w-max gap-6">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  orders={getOrdersByStatus(column.id)}
                />
              ))}
            </div>
          )}
        </div>

        {createPortal(
          <DragOverlay>
            {activeOrder ? <OrderCard order={activeOrder} isOverlay /> : null}
          </DragOverlay>,
          document.body,
        )}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ column, orders }: { column: any; orders: any[] }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex w-80 flex-col rounded-xl border border-gray-200 bg-gray-100/50 shadow-sm dark:border-gray-700 dark:bg-gray-800/50"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${column.color}`}></div>
          <h3 className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-gray-100">
            {column.title}
          </h3>
          <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600">
            {orders.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Column Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {orders.map((order) => (
          <DraggableOrderCard key={order.id} order={order} />
        ))}
        {orders.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">
              Sin Pedidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableOrderCard({ order }: { order: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 opacity-50"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <OrderCard order={order} />
    </div>
  );
}

function OrderCard({ order, isOverlay }: { order: any; isOverlay?: boolean }) {
  const priorityColors: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    normal: "bg-blue-100 text-blue-600",
    high: "bg-orange-100 text-orange-600",
    urgent: "bg-red-600 text-white animate-pulse",
  };

  const Content = (
    <div
      className={`group block cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 ${
        isOverlay
          ? "scale-105 rotate-2 cursor-grabbing shadow-xl ring-2 ring-blue-500 ring-offset-2"
          : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] font-black text-gray-400 group-hover:text-blue-600">
          {order.orderNumber}
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${priorityColors[order.priority]}`}
        >
          {order.priority}
        </span>
      </div>

      <div className="space-y-2">
        <p className="line-clamp-1 text-sm font-bold text-gray-900">
          Cliente #{order.customerId.substring(0, 5)}
        </p>

        <div className="flex items-start gap-1.5 text-xs text-gray-500">
          <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">Entrega solicitada para hoy</span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500">
              U
            </div>
            <span className="text-[10px] font-medium text-gray-400">
              Sin asignar
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-900">
            ${Number(order.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  if (isOverlay) return Content;

  return (
    <Link href={`/dashboard/orders/${order.id}`} className="block">
      {Content}
    </Link>
  );
}
