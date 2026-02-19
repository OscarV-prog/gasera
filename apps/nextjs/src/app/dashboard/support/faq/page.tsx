"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
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
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestión de FAQs (Soporte)
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Administra las preguntas frecuentes y categorías para el Centro de
          Ayuda.
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger
            value="items"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100"
          >
            Preguntas
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-100"
          >
            Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-6">
          <FAQItemsTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <FAQCategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FAQItemsTab() {
  const api = useTRPC();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    api.faq.listItems.queryOptions({
      search: search || undefined,
      categoryId: undefined,
    }),
  );

  if (isLoading) {
    return (
      <div className="py-8 text-center text-slate-500">
        Cargando preguntas...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Input
          placeholder="Buscar preguntas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        />
        <CreateFAQItemDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => void refetch()}
        />
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Pregunta
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Categoría
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Vistas
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Estatus
              </TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-400">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  No se encontraron preguntas.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((item: any) => (
                <TableRow
                  key={item.id}
                  className="border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {item.question}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-slate-200 font-normal text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    >
                      {item.categoryName || "Sin categoría"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {item.views || 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        item.isActive
                          ? "bg-green-100 text-green-700 shadow-none hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          : "bg-slate-100 text-slate-700 shadow-none hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      }
                    >
                      {item.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="dark:border-slate-800 dark:bg-slate-900"
                      >
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator className="dark:bg-slate-800" />
                        <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Edit2 className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600 dark:text-red-400 dark:hover:bg-red-900/20 dark:focus:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FAQCategoriesTab() {
  const api = useTRPC();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    api.faq.listCategories.queryOptions({}),
  );

  if (isLoading) {
    return (
      <div className="py-8 text-center text-slate-500">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Categorías de FAQ
        </h2>
        <CreateCategoryDialog
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => void refetch()}
        />
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Nombre
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Descripción
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Orden
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Estatus
              </TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-400">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  No hay categorías creadas.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((category: any) => (
                <TableRow
                  key={category.id}
                  className="border-slate-100 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {category.description || "N/A"}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {category.displayOrder || 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        category.isActive
                          ? "bg-green-100 text-green-700 shadow-none hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          : "bg-slate-100 text-slate-700 shadow-none hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      }
                    >
                      {category.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreateCategoryDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const api = useTRPC();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  });

  const createMutation = useMutation(
    api.faq.createCategory.mutationOptions({
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
        setFormData({ name: "", description: "", displayOrder: 0 });
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Nueva Categoría</Button>
      </DialogTrigger>
      <DialogContent className="dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Crear Categoría FAQ
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Añade una categoría para organizar tus preguntas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-slate-700 dark:text-slate-300"
            >
              Nombre *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-slate-700 dark:text-slate-300"
            >
              Descripción
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="displayOrder"
              className="text-slate-700 dark:text-slate-300"
            >
              Orden de Visualización
            </Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateFAQItemDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    categoryId: "",
  });

  const { data: categories } = useQuery(
    api.faq.listCategories.queryOptions({}),
  );

  const createMutation = useMutation(
    api.faq.createItem.mutationOptions({
      onSuccess: async () => {
        onSuccess();
        onOpenChange(false);
        setFormData({ question: "", answer: "", categoryId: "" });
        await queryClient.invalidateQueries(api.faq.pathFilter());
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      categoryId: formData.categoryId || "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Agregar Pregunta</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Crear Pregunta Frecuente
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Añade una nueva pregunta para el centro de ayuda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="question"
              className="text-slate-700 dark:text-slate-300"
            >
              Pregunta *
            </Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              required
              className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="answer"
              className="text-slate-700 dark:text-slate-300"
            >
              Respuesta *
            </Label>
            <textarea
              id="answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={6}
              className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="categoryId"
              className="text-slate-700 dark:text-slate-300"
            >
              Categoría
            </Label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Selecciona una categoría...</option>
              {categories?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
