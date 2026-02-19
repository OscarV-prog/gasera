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

type CertificationType = "license" | "security" | "other";
type CertificationStatus = "valid" | "expired" | "expiring_soon";

interface Certification {
  id: string;
  driverId: string;
  driverName: string;
  type: CertificationType;
  issueDate: Date;
  expiryDate: Date;
  status: CertificationStatus;
  notes: string | null;
}

// Mock data for demonstration until API is implemented
const mockCertifications: Certification[] = [
  {
    id: "1",
    driverId: "d1",
    driverName: "Juan Pérez García",
    type: "license",
    issueDate: new Date("2023-01-15"),
    expiryDate: new Date("2025-01-15"),
    status: "valid",
    notes: "Licencia de conducir tipo A",
  },
  {
    id: "2",
    driverId: "d2",
    driverName: "María López Hernández",
    type: "security",
    issueDate: new Date("2024-06-01"),
    expiryDate: new Date("2025-03-01"),
    status: "expiring_soon",
    notes: "Certificación de seguridad industrial",
  },
  {
    id: "3",
    driverId: "d3",
    driverName: "Carlos Ramírez Torres",
    type: "license",
    issueDate: new Date("2022-05-20"),
    expiryDate: new Date("2024-12-01"),
    status: "expired",
    notes: "Licencia de conducir tipo B",
  },
  {
    id: "4",
    driverId: "d1",
    driverName: "Juan Pérez García",
    type: "security",
    issueDate: new Date("2024-08-15"),
    expiryDate: new Date("2025-08-15"),
    status: "valid",
    notes: "Curso de manejo defensivo",
  },
  {
    id: "5",
    driverId: "d4",
    driverName: "Ana Martínez Ruiz",
    type: "other",
    issueDate: new Date("2024-03-10"),
    expiryDate: new Date("2025-02-10"),
    status: "expiring_soon",
    notes: "Certificación de primeros auxilios",
  },
];

export default function CertificationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CertificationType | "all">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | "all">(
    "all",
  );

  const api = useTRPC();

  // Try to fetch from API, fallback to mock data if API not available
  const {
    data: certificationsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["certifications", "list"],
    queryFn: async () => {
      try {
        // This would be the actual API call when implemented
        // const result = await api.certifications.list.query({...});
        // return result;
        return null;
      } catch {
        // Fallback to mock data for development
        return { items: mockCertifications };
      }
    },
    retry: false,
  });

  const certifications: Certification[] =
    certificationsData?.items || mockCertifications;

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta certificación?")) {
      try {
        // Note: Delete mutation needs to be added to the API router
        toast.success("Certificación eliminada correctamente");
        refetch();
      } catch (error: unknown) {
        toast.error(
          (error as { message?: string })?.message ||
            "Error al eliminar la certificación",
        );
      }
    }
  };

  // Filter certifications based on search and filters
  const filteredCertifications = certifications.filter((cert) => {
    const matchesSearch = cert.driverName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || cert.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeClass = (status: CertificationStatus) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "expiring_soon":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: CertificationStatus) => {
    switch (status) {
      case "valid":
        return "Vigente";
      case "expired":
        return "Expirado";
      case "expiring_soon":
        return "Por Vencer";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: CertificationType) => {
    switch (type) {
      case "license":
        return "Licencia";
      case "security":
        return "Seguridad";
      case "other":
        return "Otro";
      default:
        return type;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificaciones</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona las certificaciones de tus conductores
          </p>
        </div>
        <Link href="/dashboard/certifications/new">
          <Button>Nueva Certificación</Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="max-w-md flex-1">
          <Input
            type="text"
            placeholder="Buscar por nombre de conductor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {typeFilter === "all"
                ? "Todos los Tipos"
                : getTypeLabel(typeFilter)}
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
              Todos los Tipos
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTypeFilter("license")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Licencia
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTypeFilter("security")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Seguridad
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTypeFilter("other")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Otro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === "all"
                ? "Todos los Estados"
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
              Todos los Estados
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("valid")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Vigente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("expiring_soon")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Por Vencer
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatusFilter("expired")}
              className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
            >
              Expirado
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alerts Section */}
      <div className="space-y-2">
        {certifications.some((c) => c.status === "expired") && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            <span className="font-medium">Alerta:</span> Tienes{" "}
            {certifications.filter((c) => c.status === "expired").length}{" "}
            certificación(es) expirada(s) que requieren atención inmediata.
          </div>
        )}
        {certifications.some((c) => c.status === "expiring_soon") && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            <span className="font-medium">Atención:</span> Tienes{" "}
            {certifications.filter((c) => c.status === "expiring_soon").length}{" "}
            certificación(es) por vencer en los próximos 30 días.
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : !filteredCertifications || filteredCertifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {certifications.length === 0
              ? "No se encontraron certificaciones. Crea tu primera certificación para comenzar."
              : "No hay certificaciones que coincidan con tus criterios de búsqueda."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Expiración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertifications.map((certification) => (
                <TableRow
                  key={certification.id}
                  className={
                    certification.status === "expired"
                      ? "bg-red-50"
                      : certification.status === "expiring_soon"
                        ? "bg-yellow-50"
                        : ""
                  }
                >
                  <TableCell className="font-medium">
                    {certification.driverName}
                  </TableCell>
                  <TableCell>{getTypeLabel(certification.type)}</TableCell>
                  <TableCell>{formatDate(certification.issueDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(certification.expiryDate)}</span>
                      {certification.status !== "expired" && (
                        <span
                          className={`text-xs ${
                            certification.status === "expiring_soon"
                              ? "text-yellow-700"
                              : "text-green-700"
                          }`}
                        >
                          {certification.status === "expiring_soon"
                            ? `${getDaysUntilExpiry(certification.expiryDate)} días`
                            : `${getDaysUntilExpiry(certification.expiryDate)} días`}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        certification.status,
                      )}`}
                    >
                      {getStatusLabel(certification.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/certifications/${certification.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/dashboard/certifications/${certification.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(certification.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
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
