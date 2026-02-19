"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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

type AssetStatus =
  | "in_stock"
  | "in_route"
  | "delivered"
  | "maintenance"
  | "retired";
type AssetType = "cylinder" | "tank";

interface Asset {
  id: string;
  serialNumber: string;
  assetType: AssetType;
  subtype: string | null;
  capacity: number | null;
  status: AssetStatus;
  currentOwnerId: string | null;
  currentOwnerType: string | null;
  location: string | null;
  lastInspectionDate: Date | null;
  createdAt: Date | null;
}

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const api = useTRPC();

  const assetsQuery = useQuery(
    api.assets.list.queryOptions({
      search: search || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const deleteMutation = api.assets.delete.useMutation({
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      void assetsQuery.refetch();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Failed to delete asset");
    },
  });

  const assets = assetsQuery.data?.items || [];
  const isLoading = assetsQuery.isLoading;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.serialNumber
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || asset.assetType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeClass = (status: AssetStatus) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800";
      case "in_route":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "retired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "in_route":
        return "In Route";
      case "delivered":
        return "Delivered";
      case "maintenance":
        return "Maintenance";
      case "retired":
        return "Retired";
      default:
        return status;
    }
  };

  const getAssetTypeLabel = (type: AssetType) => {
    switch (type) {
      case "cylinder":
        return "Cylinder";
      case "tank":
        return "Tank";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your gas cylinders and tanks
          </p>
        </div>
        <Link href="/dashboard/assets/new">
          <Button>Nuevo Activo</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-md flex-1">
          <Input
            type="text"
            placeholder="Search by serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {typeFilter === "all"
                ? "All Types"
                : getAssetTypeLabel(typeFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 w-48 rounded-md border bg-white p-1 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => setTypeFilter("all")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              All Types
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTypeFilter("cylinder")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Cylinder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTypeFilter("tank")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Tank
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === "all"
                ? "All Statuses"
                : getStatusLabel(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 w-48 rounded-md border bg-white p-1 shadow-lg"
          >
            <DropdownMenuItem
              onClick={() => setStatusFilter("all")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("in_stock")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              In Stock
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("in_route")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              In Route
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("delivered")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Delivered
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
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !filteredAssets || filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {assets.length === 0
              ? "No assets found. Create your first asset to get started."
              : "No assets match your search criteria."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subtype</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    {asset.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono">
                    {asset.serialNumber}
                  </TableCell>
                  <TableCell className="capitalize">
                    {getAssetTypeLabel(asset.assetType)}
                  </TableCell>
                  <TableCell>{asset.subtype || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        asset.status,
                      )}`}
                    >
                      {getStatusLabel(asset.status)}
                    </span>
                  </TableCell>
                  <TableCell>{asset.location || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/assets/${asset.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/assets/${asset.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="text-red-600 hover:text-red-900"
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
