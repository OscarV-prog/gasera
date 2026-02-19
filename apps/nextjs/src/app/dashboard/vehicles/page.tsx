"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

type VehicleStatus = "active" | "maintenance" | "retired";
type VehicleType = "truck" | "van" | "pickup" | "motorcycle";

interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number | null;
  capacityWeight: number | null;
  capacityVolume: number | null;
  status: VehicleStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">(
    "all",
  );

  const api = useTRPC();

  const {
    data: vehicles,
    isLoading,
    refetch,
  } = useQuery(api.vehicles.list.queryOptions());

  const deleteMutation = useMutation(
    api.vehicles.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Vehicle deleted successfully");
        refetch();
      },
      onError: (error: { message?: string }) => {
        toast.error(error.message || "Failed to delete vehicle");
      },
    }),
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch = vehicle.licensePlate
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: VehicleStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "retired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVehicleTypeLabel = (type: VehicleType) => {
    switch (type) {
      case "truck":
        return "Truck";
      case "van":
        return "Van";
      case "pickup":
        return "Pickup";
      case "motorcycle":
        return "Motorcycle";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Vehicles
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your fleet of vehicles
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>Nuevo Vehículo</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-md flex-1">
          <Input
            type="text"
            placeholder="Search by license plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === "all" ? "All Statuses" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 w-48 rounded-md border bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <DropdownMenuItem
              onClick={() => setStatusFilter("all")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("active")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("maintenance")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Maintenance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("retired")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Retired
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:border dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !filteredVehicles || filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {vehicles?.length === 0
              ? "No vehicles found. Create your first vehicle to get started."
              : "No vehicles match your search criteria."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    {vehicle.licensePlate}
                  </TableCell>
                  <TableCell className="capitalize">
                    {getVehicleTypeLabel(vehicle.vehicleType)}
                  </TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.year || "-"}</TableCell>
                  <TableCell>
                    {vehicle.capacityWeight
                      ? `${vehicle.capacityWeight} kg`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        vehicle.status,
                      )}`}
                    >
                      {vehicle.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
