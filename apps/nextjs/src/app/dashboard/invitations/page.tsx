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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@acme/ui";

// SVG Icons as components with className support
const IconMail = ({ className = "" }: { className?: string }) => (
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
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconUsers = ({ className = "" }: { className?: string }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconUserPlus = ({ className = "" }: { className?: string }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" x2="20" y1="8" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconRefresh = ({ className = "" }: { className?: string }) => (
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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
    <path d="M3 3v9h9" />
  </svg>
);

const IconX = ({ className = "" }: { className?: string }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconCheck = ({ className = "" }: { className?: string }) => (
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
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClock = ({ className = "" }: { className?: string }) => (
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
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconLink = ({ className = "" }: { className?: string }) => (
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
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconSend = ({ className = "" }: { className?: string }) => (
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
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
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

const IconTruck = ({ className = "" }: { className?: string }) => (
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Types
type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";
type InvitationRole = "admin" | "operator" | "driver";

interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: InvitationStatus;
  createdAt: Date | null;
  invitedBy: string | null;
}

// Mock data
const mockInvitations: Invitation[] = [
  {
    id: "inv-001",
    email: "juan.perez@gasera.com",
    role: "operator",
    status: "pending",
    createdAt: new Date("2025-02-10"),
    invitedBy: "admin@gasera.com",
  },
  {
    id: "inv-002",
    email: "maria.garcia@gasera.com",
    role: "driver",
    status: "accepted",
    createdAt: new Date("2025-02-05"),
    invitedBy: "admin@gasera.com",
  },
  {
    id: "inv-003",
    email: "carlos.sanchez@gasera.com",
    role: "admin",
    status: "pending",
    createdAt: new Date("2025-02-08"),
    invitedBy: "admin@gasera.com",
  },
  {
    id: "inv-004",
    email: "ana.lopez@gasera.com",
    role: "operator",
    status: "cancelled",
    createdAt: new Date("2025-01-28"),
    invitedBy: "admin@gasera.com",
  },
  {
    id: "inv-005",
    email: "pedro.martinez@gasera.com",
    role: "driver",
    status: "expired",
    createdAt: new Date("2025-01-15"),
    invitedBy: "admin@gasera.com",
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

function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-lg leading-none font-semibold tracking-tight ${className}`}
    >
      {children}
    </h3>
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

// Role display helpers
function getRoleDisplay(role: InvitationRole): string {
  const roleMap: Record<InvitationRole, string> = {
    admin: "Admin",
    operator: "Operator",
    driver: "Driver",
  };
  return roleMap[role] || role;
}

function getRoleColor(role: InvitationRole): string {
  const colorMap: Record<InvitationRole, string> = {
    admin: "bg-purple-100 text-purple-800",
    operator: "bg-blue-100 text-blue-800",
    driver: "bg-green-100 text-green-800",
  };
  return colorMap[role] || "bg-gray-100 text-gray-800";
}

// Status display helpers
function getStatusDisplay(status: InvitationStatus): string {
  const statusMap: Record<InvitationStatus, string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return statusMap[status] || status;
}

function getStatusColor(status: InvitationStatus): string {
  const colorMap: Record<InvitationStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

// Format date
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<InvitationRole>("operator");
  const [isLoading, setIsLoading] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = invitations.length;
    const pending = invitations.filter((i) => i.status === "pending").length;
    const accepted = invitations.filter((i) => i.status === "accepted").length;
    return { total, pending, accepted };
  }, [invitations]);

  // Handlers
  const handleSendInvitation = useCallback(async () => {
    if (!newEmail.trim()) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      email: newEmail,
      role: newRole,
      status: "pending",
      createdAt: new Date(),
      invitedBy: "admin@gasera.com",
    };

    setInvitations((prev) => [newInvitation, ...prev]);
    setIsDialogOpen(false);
    setNewEmail("");
    setNewRole("operator");
    setIsLoading(false);

    toast.success("Invitación enviada correctamente");
  }, [newEmail, newRole]);

  const handleResendInvitation = useCallback(async (id: string) => {
    toast.success("Invitación reenviada correctamente");
  }, []);

  const handleCancelInvitation = useCallback(async (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "cancelled" } : inv,
      ),
    );
    toast.success("Invitación cancelada");
  }, []);

  const handleCopyLink = useCallback(
    async (id: string) => {
      const invitation = invitations.find((inv) => inv.id === id);
      if (invitation) {
        const inviteLink = `https://gasera.app/join/${id}`;
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Enlace copiado al portapapeles");
      }
    },
    [invitations],
  );

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitaciones de Equipo</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las invitaciones para tu organización
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <IconUserPlus className="h-4 w-4" />
          Nueva Invitación
        </Button>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Enviadas
            </CardTitle>
            <IconMail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Pendientes
            </CardTitle>
            <IconClock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Aceptadas
            </CardTitle>
            <IconCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Invitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enviada por</TableHead>
                <TableHead>Fecha de envío</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    {invitation.email}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(invitation.role)}>
                      {getRoleDisplay(invitation.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invitation.status)}>
                      {getStatusDisplay(invitation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{invitation.invitedBy || "-"}</TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invitation.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleResendInvitation(invitation.id)
                            }
                            title="Reenviar invitación"
                          >
                            <IconRefresh className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCancelInvitation(invitation.id)
                            }
                            title="Cancelar invitación"
                          >
                            <IconX className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(invitation.id)}
                        title="Copiar enlace"
                      >
                        <IconLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {invitations.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              <IconUsers className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No hay invitaciones yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Invitation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Nueva Invitación</DialogTitle>
            <DialogDescription>
              Ingresa el email y selecciona el rol para la nueva invitación.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Rol
              </label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as InvitationRole)}
                className="border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <IconRefresh className="h-4 w-4 animate-spin" />
              ) : (
                <IconSend className="h-4 w-4" />
              )}
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
