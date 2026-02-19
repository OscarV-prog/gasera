"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BadgeInfo,
  Building2,
  ChevronLeft,
  Clock,
  CreditCard,
  Edit,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  User,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function CustomerDetailPage({
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

  const customer = customerQuery.data;

  if (customerQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <BadgeInfo className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold">Cliente no encontrado</h2>
        <Button onClick={() => router.push("/dashboard/customers")}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
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
                className="font-mono text-[10px] text-blue-600 dark:text-blue-400"
              >
                {customer.customerCode}
              </Badge>
              <Badge
                variant={customer.status === "active" ? "default" : "secondary"}
                className={
                  customer.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }
              >
                {customer.status === "active" ? "Activo" : customer.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              {customer.businessName || customer.tradeName || "Sin Nombre"}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              Cliente desde{" "}
              {format(new Date(customer.createdAt), "MMMM yyyy", {
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/customers/${customer.id}/edit`}>
            <Button
              variant="outline"
              className="border-gray-200 dark:border-gray-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Package className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Summary Cards */}
        <div className="space-y-6 lg:col-span-4">
          {/* Main Info Card */}
          <Card className="border-gray-200 shadow-sm dark:border-gray-800">
            <CardHeader className="pb-3 text-center">
              <Avatar className="mx-auto h-20 w-20 border-4 border-white shadow-lg dark:border-gray-800">
                <AvatarFallback className="bg-blue-50 text-2xl font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {(customer.businessName || "C").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl">
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                <Mail className="h-4 w-4 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Email
                  </span>
                  <span className="text-sm font-medium">{customer.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                <Phone className="h-4 w-4 text-gray-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Teléfono
                  </span>
                  <span className="text-sm font-medium">{customer.phone}</span>
                </div>
              </div>
              {customer.taxId && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      RFC / Tax ID
                    </span>
                    <span className="text-sm font-medium">
                      {customer.taxId}
                    </span>
                  </div>
                </div>
              )}
              {customer.notes && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      Notas
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 italic dark:text-gray-400">
                    "{customer.notes}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-gray-200 shadow-sm dark:border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {(customer as any).addresses?.length || 0}
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Direcciones
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm dark:border-gray-800">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">
                  Pedidos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Dynamic Content */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="addresses" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 dark:border-gray-800">
              <TabsTrigger
                value="addresses"
                className="rounded-none border-b-2 border-transparent px-6 pt-2 pb-3 font-bold transition-all data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Direcciones
              </TabsTrigger>
              <TabsTrigger
                value="contacts"
                className="rounded-none border-b-2 border-transparent px-6 pt-2 pb-3 font-bold transition-all data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                <User className="mr-2 h-4 w-4" />
                Contactos
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none border-b-2 border-transparent px-6 pt-2 pb-3 font-bold transition-all data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600"
              >
                <Package className="mr-2 h-4 w-4" />
                Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="addresses" className="pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {(customer as any).addresses?.length > 0 ? (
                  (customer as any).addresses.map((addr: any) => (
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
                              {addr.internalNumber &&
                                `, Int. ${addr.internalNumber}`}
                              <br />
                              {addr.neighborhood}, {addr.municipality}
                              <br />
                              {addr.city}, {addr.state} | CP {addr.postalCode}
                            </p>
                          </div>
                          {addr.isDefaultDelivery === 1 && (
                            <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              Principal
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <MapPin className="h-6 w-6 opacity-20" />
                    <p className="text-sm">No hay direcciones registradas.</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="h-full min-h-[100px] border-dashed text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Dirección
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                {(customer as any).contacts?.length > 0 ? (
                  (customer as any).contacts.map((contact: any) => (
                    <Card key={contact.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {contact.name.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold">{contact.name}</h4>
                            <p className="text-xs text-gray-500">
                              {contact.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {contact.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                    <User className="h-6 w-6 opacity-20" />
                    <p className="text-sm">
                      No hay personas de contacto registradas.
                    </p>
                    <Button variant="link" className="text-blue-600">
                      Agregar contacto
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="pt-6">
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">
                  Historial de pedidos próximamente
                </p>
                <p className="text-xs">
                  Podrás ver todos los pedidos y facturas aquí.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
