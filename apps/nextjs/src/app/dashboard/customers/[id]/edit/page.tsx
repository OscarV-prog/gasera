"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

interface AddressFormData {
  id: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  neighborhood: string;
  municipality: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  isDefaultDelivery: boolean;
  nickname: string;
}

export default function EditCustomerPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const api = useTRPC();
  const router = useRouter();

  const customerQuery = useQuery(
    api.customers.byId.queryOptions({ id: params.id }),
  );

  const [customerType, setCustomerType] = useState<
    "residential" | "corporate" | "government"
  >("residential");
  const [formData, setFormData] = useState({
    businessName: "",
    tradeName: "",
    taxId: "",
    email: "",
    phone: "",
    alternatePhone: "",
    notes: "",
    status: "active",
  });

  const [addresses, setAddresses] = useState<AddressFormData[]>([]);

  useEffect(() => {
    if (customerQuery.data) {
      const c = customerQuery.data;
      setCustomerType((c.customerType as any) || "residential");
      setFormData({
        businessName: c.businessName || "",
        tradeName: c.tradeName || "",
        taxId: c.taxId || "",
        email: c.email || "",
        phone: c.phone || "",
        alternatePhone: c.alternatePhone || "",
        notes: c.notes || "",
        status: c.status || "active",
      });
      if ((c as any).addresses) {
        setAddresses(
          (c as any).addresses.map((a: any) => ({
            ...a,
            isDefaultDelivery: a.isDefaultDelivery === 1,
          })),
        );
      }
    }
  }, [customerQuery.data]);

  const updateMutation = useMutation(api.customers.update.mutationOptions());

  const addAddressMutation = useMutation(
    api.customers.addAddress.mutationOptions(),
  );

  const handleAddAddress = () => {
    // In edit mode, we can add it directly to the database or just to the UI if we implement a complex update
    // For now, let's keep it simple and just show the UI part for adding, but saving might need caution
    setAddresses([
      ...addresses,
      {
        id: `new-${crypto.randomUUID()}`,
        street: "",
        externalNumber: "",
        internalNumber: "",
        neighborhood: "",
        municipality: "",
        postalCode: "",
        city: "",
        state: "",
        country: "México",
        isDefaultDelivery: false,
        nickname: `Dirección ${addresses.length + 1}`,
      },
    ]);
  };

  const handleRemoveAddress = (id: string) => {
    // In a real app, this should call a delete mutation. For now, we just update UI.
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const updateAddress = (
    id: string,
    field: keyof AddressFormData,
    value: any,
  ) => {
    setAddresses(
      addresses.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value };
        }
        if (field === "isDefaultDelivery" && value === true) {
          return { ...a, isDefaultDelivery: false };
        }
        return a;
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        id: params.id,
        ...formData,
        status: formData.status as any,
        customerType: customerType as any,
      },
      {
        onSuccess: () => {
          toast.success("¡Cliente actualizado con éxito!");
          router.push("/dashboard/customers");
        },
        onError: (error: any) => {
          toast.error(`Error: ${error.message}`);
        },
      },
    );
  };

  if (customerQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-blue-600 dark:text-blue-400"
            >
              CRM - {customerQuery.data?.customerCode}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Editar Cliente
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Type Selection */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setCustomerType("residential")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              customerType === "residential"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${customerType === "residential" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
            >
              <User className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">Residencial</span>
              <span className="text-xs text-gray-500">Persona Física</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCustomerType("corporate")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              customerType === "corporate"
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10"
                : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${customerType === "corporate" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">Empresarial</span>
              <span className="text-xs text-gray-500">Persona Moral</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCustomerType("government")}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
              customerType === "government"
                ? "border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${customerType === "government" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block font-bold">Gubernamental</span>
              <span className="text-xs text-gray-500">Entidad Pública</span>
            </div>
          </button>
        </div>

        {/* Basic Info Card */}
        <Card className="border-gray-200 shadow-sm dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-500" />
              Datos del {customerType === "residential" ? "Cliente" : "Negocio"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  {customerType === "residential"
                    ? "Nombre Completo *"
                    : "Razón Social *"}
                </Label>
                <Input
                  placeholder={
                    customerType === "residential"
                      ? "Ej. Juan Pérez"
                      : "Ej. Empresa S.A de C.V."
                  }
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="rounded-xl border-gray-200 py-6 dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </div>

              {customerType !== "residential" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">
                      Nombre Comercial
                    </Label>
                    <Input
                      placeholder="Ej. Mi Negocio"
                      value={formData.tradeName}
                      onChange={(e) =>
                        setFormData({ ...formData, tradeName: e.target.value })
                      }
                      className="rounded-xl border-gray-200 py-6 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase">
                      RFC (Tax ID)
                    </Label>
                    <Input
                      placeholder="ABC123456XYZ"
                      value={formData.taxId}
                      onChange={(e) =>
                        setFormData({ ...formData, taxId: e.target.value })
                      }
                      className="rounded-xl border-gray-200 py-6 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  Correo Electrónico *
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-xl border-gray-200 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  Teléfono *
                </Label>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="669 123 4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="rounded-xl border-gray-200 py-6 pl-10 dark:border-gray-700 dark:bg-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  Estado del Cliente
                </Label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                  <option value="prospect">Prospecto</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Section (Read-only or limited manage in edit for now) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-indigo-500" />
              Direcciones Registradas
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Nueva
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className="group transition-all hover:border-blue-200 dark:hover:border-blue-900/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100">
                        {addr.nickname || "Dirección de Entrega"}
                      </h4>
                      <p className="text-xs leading-tight text-gray-500">
                        {addr.street} {addr.externalNumber}
                        {addr.internalNumber && `, Int. ${addr.internalNumber}`}
                        <br />
                        {addr.neighborhood}, {addr.municipality}
                        <br />
                        {addr.city}, {addr.state} | CP {addr.postalCode}
                      </p>
                    </div>
                    {addr.isDefaultDelivery && (
                      <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        Principal
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {addresses.length === 0 && (
              <div className="col-span-full flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                <MapPin className="h-6 w-6 opacity-20" />
                <p className="text-sm">No hay direcciones registradas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <Card className="border-gray-200 shadow-sm dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Cualquier información relevante..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-12 min-w-[120px] rounded-xl"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-12 min-w-[200px] rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20"
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
