"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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

export default function NewCustomerPage() {
  const api = useTRPC();
  const router = useRouter();

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
  });

  const [addresses, setAddresses] = useState<AddressFormData[]>([
    {
      id: crypto.randomUUID(),
      street: "",
      externalNumber: "",
      internalNumber: "",
      neighborhood: "",
      municipality: "",
      postalCode: "",
      city: "",
      state: "",
      country: "México",
      isDefaultDelivery: true,
      nickname: "Principal",
    },
  ]);

  const createMutation = useMutation(
    api.customers.create.mutationOptions({
      onSuccess: () => {
        toast.success("¡Cliente creado con éxito!");
        router.push("/dashboard/customers");
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    }),
  );

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: crypto.randomUUID(),
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
    if (addresses.length === 1) {
      toast.error("Debes tener al menos una dirección");
      return;
    }
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

    // Simple validation
    if (!formData.email || !formData.phone) {
      toast.error("Email y teléfono son obligatorios");
      return;
    }

    if (customerType === "residential" && !formData.businessName) {
      toast.error("El nombre completo es obligatorio");
      return;
    }

    if (customerType === "corporate" && !formData.businessName) {
      toast.error("La razón social es obligatoria");
      return;
    }

    createMutation.mutate({
      ...formData,
      customerType,
      addresses: addresses.map(({ id, ...rest }) => rest),
    } as any);
  };

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
              CRM
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Nuevo Cliente
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
            </div>
          </CardContent>
        </Card>

        {/* Addresses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-indigo-500" />
              Direcciones de Entrega
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAddress}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Dirección
            </Button>
          </div>

          <div className="space-y-6">
            {addresses.map((address, index) => (
              <Card
                key={address.id}
                className="relative overflow-hidden border-gray-200 dark:border-gray-800"
              >
                {address.isDefaultDelivery && (
                  <div className="absolute top-0 right-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-[10px] font-bold text-white uppercase">
                    Principal
                  </div>
                )}
                <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 py-3 dark:bg-gray-800/50">
                  <CardTitle className="text-sm font-bold opacity-70">
                    Dirección #{index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleRemoveAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        Calle *
                      </Label>
                      <Input
                        placeholder="Calle principal"
                        value={address.street}
                        onChange={(e) =>
                          updateAddress(address.id, "street", e.target.value)
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">
                          Ext *
                        </Label>
                        <Input
                          placeholder="123"
                          value={address.externalNumber}
                          onChange={(e) =>
                            updateAddress(
                              address.id,
                              "externalNumber",
                              e.target.value,
                            )
                          }
                          className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase">
                          Int
                        </Label>
                        <Input
                          placeholder="A"
                          value={address.internalNumber}
                          onChange={(e) =>
                            updateAddress(
                              address.id,
                              "internalNumber",
                              e.target.value,
                            )
                          }
                          className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        Colonia *
                      </Label>
                      <Input
                        placeholder="Centro"
                        value={address.neighborhood}
                        onChange={(e) =>
                          updateAddress(
                            address.id,
                            "neighborhood",
                            e.target.value,
                          )
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        Municipio *
                      </Label>
                      <Input
                        placeholder="Mazatlán"
                        value={address.municipality}
                        onChange={(e) =>
                          updateAddress(
                            address.id,
                            "municipality",
                            e.target.value,
                          )
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        Ciudad *
                      </Label>
                      <Input
                        placeholder="Mazatlán"
                        value={address.city}
                        onChange={(e) =>
                          updateAddress(address.id, "city", e.target.value)
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        Estado *
                      </Label>
                      <Input
                        placeholder="Sinaloa"
                        value={address.state}
                        onChange={(e) =>
                          updateAddress(address.id, "state", e.target.value)
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase">
                        CP *
                      </Label>
                      <Input
                        placeholder="82000"
                        value={address.postalCode}
                        onChange={(e) =>
                          updateAddress(
                            address.id,
                            "postalCode",
                            e.target.value,
                          )
                        }
                        className="h-10 rounded-lg border-gray-100 dark:border-gray-700"
                        required
                      />
                    </div>
                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant={
                          address.isDefaultDelivery ? "default" : "outline"
                        }
                        className="h-10 w-full text-xs font-bold uppercase"
                        onClick={() =>
                          updateAddress(address.id, "isDefaultDelivery", true)
                        }
                      >
                        {address.isDefaultDelivery
                          ? "Dirección Principal"
                          : "Marcar como Principal"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            disabled={createMutation.isPending}
            className="h-12 min-w-[200px] rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20"
          >
            {createMutation.isPending ? "Creando..." : "Crear Cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
