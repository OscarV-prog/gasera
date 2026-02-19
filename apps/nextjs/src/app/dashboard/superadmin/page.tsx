"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@acme/ui";

// SVG Icons as components with className support
const IconBuilding = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const IconUsers = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconShield = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const IconCalendar = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const IconMoreHorizontal = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const IconPlus = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const IconSearch = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconFilter = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const IconCheckCircle = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconXCircle = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" x2="9" y1="9" y2="15" />
    <line x1="9" x2="15" y1="9" y2="15" />
  </svg>
);

const IconTrash2 = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const IconEye = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Types
type OrganizationStatus = "active" | "suspended" | "cancelled" | "past_due";
type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise";

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: OrganizationStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
  userCount: number;
  vehicleCount: number;
}

interface Plan {
  id: string;
  name: string;
  price: number | null;
  maxUsers: number;
  maxVehicles: number;
}

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Gasera Principal",
    subdomain: "gasera-principal",
    contactEmail: "admin@gasera.com",
    subscriptionPlan: "enterprise",
    subscriptionStatus: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-02-01"),
    userCount: 45,
    vehicleCount: 12,
  },
  {
    id: "org-002",
    name: "Distribuidora del Norte",
    subdomain: "norte",
    contactEmail: "contacto@norte-gas.mx",
    subscriptionPlan: "professional",
    subscriptionStatus: "active",
    createdAt: new Date("2024-03-20"),
    updatedAt: new Date("2025-01-28"),
    userCount: 28,
    vehicleCount: 8,
  },
  {
    id: "org-003",
    name: "Gas Express Sur",
    subdomain: "gas-express-sur",
    contactEmail: "info@gexpresssur.com",
    subscriptionPlan: "starter",
    subscriptionStatus: "suspended",
    createdAt: new Date("2024-06-10"),
    updatedAt: new Date("2025-02-05"),
    userCount: 12,
    vehicleCount: 4,
  },
  {
    id: "org-004",
    name: "PyME Gas",
    subdomain: "pyme-gas",
    contactEmail: "admin@pyme-gas.mx",
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    createdAt: new Date("2024-09-01"),
    updatedAt: new Date("2025-02-10"),
    userCount: 3,
    vehicleCount: 2,
  },
  {
    id: "org-005",
    name: "MegaGas Centro",
    subdomain: "megagas-centro",
    contactEmail: "operaciones@megagas.com",
    subscriptionPlan: "enterprise",
    subscriptionStatus: "past_due",
    createdAt: new Date("2024-02-28"),
    updatedAt: new Date("2025-02-08"),
    userCount: 67,
    vehicleCount: 18,
  },
  {
    id: "org-006",
    name: "Nueva Empresa Test",
    subdomain: "nueva-test",
    contactEmail: "test@test.com",
    subscriptionPlan: "free",
    subscriptionStatus: "active",
    createdAt: new Date("2025-02-10"),
    updatedAt: new Date("2025-02-10"),
    userCount: 2,
    vehicleCount: 1,
  },
];

const mockPlans: Plan[] = [
  { id: "free", name: "Free", price: 0, maxUsers: 5, maxVehicles: 2 },
  { id: "starter", name: "Starter", price: 99, maxUsers: 20, maxVehicles: 10 },
  {
    id: "professional",
    name: "Professional",
    price: 299,
    maxUsers: 50,
    maxVehicles: 25,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    maxUsers: -1,
    maxVehicles: -1,
  },
];

// Custom Badge component
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

// Custom Card components
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

// Custom Select component
function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

function SelectTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-input flex h-9 w-full items-center rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return <option value={value}>{children}</option>;
}

export default function SuperadminPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | "all">(
    "all",
  );
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "all">("all");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>("free");
  const [organizations, setOrganizations] =
    useState<Organization[]>(mockOrganizations);
  const [plans] = useState<Plan[]>(mockPlans);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );

    return {
      total: organizations.length,
      active: organizations.filter((org) => org.subscriptionStatus === "active")
        .length,
      suspended: organizations.filter(
        (org) => org.subscriptionStatus === "suspended",
      ).length,
      newLastMonth: organizations.filter(
        (org) => org.createdAt && new Date(org.createdAt) >= lastMonth,
      ).length,
    };
  }, [organizations]);

  // Filter organizations based on search and filters
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.subdomain.toLowerCase().includes(search.toLowerCase()) ||
        org.contactEmail.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || org.subscriptionStatus === statusFilter;
      const matchesPlan =
        planFilter === "all" || org.subscriptionPlan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [organizations, search, statusFilter, planFilter]);

  // Handlers
  const handleToggleStatus = useCallback((org: Organization) => {
    const newStatus =
      org.subscriptionStatus === "active" ? "suspended" : "active";
    if (
      confirm(
        `¿Estás seguro de que deseas ${newStatus === "active" ? "reactivar" : "suspender"} esta organización?`,
      )
    ) {
      setIsLoading(true);
      setTimeout(() => {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === org.id ? { ...o, subscriptionStatus: newStatus } : o,
          ),
        );
        toast.success(
          newStatus === "active"
            ? "Organización reactivada correctamente"
            : "Organización suspendida correctamente",
        );
        setIsLoading(false);
      }, 500);
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedOrg && confirm("¿Estás seguro? Esta acción es irreversible.")) {
      setIsLoading(true);
      setTimeout(() => {
        setOrganizations((prev) => prev.filter((o) => o.id !== selectedOrg.id));
        toast.success("Organización eliminada correctamente");
        setShowDeleteDialog(false);
        setSelectedOrg(null);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedOrg]);

  const handleChangePlan = useCallback(() => {
    if (selectedOrg) {
      setIsLoading(true);
      setTimeout(() => {
        setOrganizations((prev) =>
          prev.map((o) =>
            o.id === selectedOrg.id ? { ...o, subscriptionPlan: newPlan } : o,
          ),
        );
        toast.success("Plan actualizado correctamente");
        setShowPlanDialog(false);
        setSelectedOrg(null);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedOrg, newPlan]);

  // Helper functions
  const getStatusBadgeClass = (status: OrganizationStatus): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "past_due":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: OrganizationStatus): string => {
    switch (status) {
      case "active":
        return "Activo";
      case "suspended":
        return "Suspendido";
      case "cancelled":
        return "Cancelado";
      case "past_due":
        return "Pago Pendiente";
      default:
        return status;
    }
  };

  const getPlanLabel = (plan: SubscriptionPlan): string => {
    const labels: Record<SubscriptionPlan, string> = {
      free: "Free",
      starter: "Starter",
      professional: "Professional",
      enterprise: "Enterprise",
    };
    return labels[plan] || plan;
  };

  const getPlanBadgeClass = (plan: SubscriptionPlan): string => {
    switch (plan) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "starter":
        return "bg-blue-100 text-blue-800";
      case "professional":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Superadmin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona todas las organizaciones y suscripciones de la plataforma
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2" />
          Nueva Organización
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Organizaciones</h3>
            <IconBuilding className="text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Todas las organizaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Organizaciones Activas</h3>
            <IconCheckCircle className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500">
              {stats.total > 0
                ? `${Math.round((stats.active / stats.total) * 100)}% del total`
                : "0% del total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Nuevas (Último Mes)</h3>
            <IconCalendar className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLastMonth}</div>
            <p className="text-xs text-gray-500">
              Organizaciones creadas recientemente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="max-w-md flex-1">
          <div className="relative">
            <IconSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, subdominio o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconFilter className="text-gray-500" />
          <Select
            value={statusFilter}
            onValueChange={(value: string) =>
              setStatusFilter(value as OrganizationStatus | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="suspended">Suspendido</SelectItem>
              <SelectItem value="past_due">Pago Pendiente</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={planFilter}
            onValueChange={(value: string) =>
              setPlanFilter(value as SubscriptionPlan | "all")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Planes</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {organizations.length === 0
              ? "No se encontraron organizaciones."
              : "No hay organizaciones que coincidan con tus criterios de búsqueda."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow
                  key={org.id}
                  className={
                    org.subscriptionStatus === "suspended"
                      ? "bg-red-50"
                      : org.subscriptionStatus === "past_due"
                        ? "bg-yellow-50"
                        : ""
                  }
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{org.name}</span>
                      <span className="text-sm text-gray-500">
                        {org.subdomain}.gasera.app
                      </span>
                      <span className="text-xs text-gray-400">
                        {org.contactEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeClass(org.subscriptionPlan)}>
                      {getPlanLabel(org.subscriptionPlan)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconUsers className="text-gray-400" />
                      <span>{org.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getStatusBadgeClass(org.subscriptionStatus)}
                    >
                      {getStatusLabel(org.subscriptionStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(org.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <IconMoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="z-50 w-48 rounded-md border bg-white p-1 shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() => setSelectedOrg(org)}
                          className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          <IconEye className="mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowPlanDialog(true);
                          }}
                          className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          <IconShield className="mr-2" />
                          Cambiar Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(org)}
                          className="cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          {org.subscriptionStatus === "active" ? (
                            <>
                              <IconXCircle className="mr-2 text-red-500" />
                              Suspender
                            </>
                          ) : (
                            <>
                              <IconCheckCircle className="mr-2 text-green-500" />
                              Reactivar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowDeleteDialog(true);
                          }}
                          className="cursor-pointer rounded px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <IconTrash2 className="mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Organization Details Dialog */}
      <Dialog
        open={!!selectedOrg && !showDeleteDialog && !showPlanDialog}
        onOpenChange={() => setSelectedOrg(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Organización</DialogTitle>
            <DialogDescription>
              Información completa de {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="subscription">Suscripción</TabsTrigger>
                <TabsTrigger value="usage">Uso</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nombre
                    </label>
                    <p className="mt-1">{selectedOrg.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Subdominio
                    </label>
                    <p className="mt-1">{selectedOrg.subdomain}.gasera.app</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email de Contacto
                    </label>
                    <p className="mt-1">{selectedOrg.contactEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fecha de Creación
                    </label>
                    <p className="mt-1">{formatDate(selectedOrg.createdAt)}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="subscription" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Plan Actual
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getPlanBadgeClass(
                          selectedOrg.subscriptionPlan,
                        )}
                      >
                        {getPlanLabel(selectedOrg.subscriptionPlan)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Estado
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getStatusBadgeClass(
                          selectedOrg.subscriptionStatus,
                        )}
                      >
                        {getStatusLabel(selectedOrg.subscriptionStatus)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="usage" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Usuarios Activos
                    </label>
                    <p className="mt-1 text-xl font-bold">
                      {selectedOrg.userCount}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Vehículos
                    </label>
                    <p className="mt-1 text-xl font-bold">
                      {selectedOrg.vehicleCount}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrg(null)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                setShowPlanDialog(true);
              }}
            >
              <IconShield className="mr-2" />
              Cambiar Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Eliminar Organización
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar "{selectedOrg?.name}"? Esta
              acción es irreversible y eliminará todos los datos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Plan</DialogTitle>
            <DialogDescription>
              Cambiar el plan de "{selectedOrg?.name}" de{" "}
              {selectedOrg && getPlanLabel(selectedOrg.subscriptionPlan)} a:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={newPlan}
              onValueChange={(value: string) =>
                setNewPlan(value as SubscriptionPlan)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getPlanBadgeClass(
                          plan.id as SubscriptionPlan,
                        )}
                      >
                        {plan.name}
                      </Badge>
                      <span className="text-gray-500">
                        {plan.price === null ? "Custom" : `$${plan.price}/mes`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan} disabled={isLoading || !newPlan}>
              {isLoading ? "Guardando..." : "Confirmar Cambio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
