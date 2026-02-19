"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Edit,
  Folder,
  HelpCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

export default function FaqsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const api = useTRPC();

  // Fetch categories for filter
  const categoriesQuery = useQuery(api.faq.listCategories.queryOptions());
  const categories = categoriesQuery.data?.data || [];

  // Fetch items
  const itemsQuery = useQuery(
    api.faq.listItems.queryOptions({
      search: search || undefined,
      categoryId: categoryId !== "all" ? categoryId : undefined,
    }),
  );

  const data = itemsQuery.data?.data;
  const isLoading = itemsQuery.isLoading;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Preguntas Frecuentes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra el centro de ayuda para clientes y choferes.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/faqs/categories">
            <Button variant="outline">
              <Folder className="mr-2 h-4 w-4" />
              Categorías
            </Button>
          </Link>
          <Link href="/dashboard/faqs/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Pregunta
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950">
        <div className="relative w-full flex-1 sm:max-w-sm">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar pregunta..."
            className="bg-white pl-9 dark:bg-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Todas las categorías" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="w-[300px] text-slate-700 dark:text-slate-400">
                Pregunta
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-400">
                Categoría
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  Cargando preguntas...
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500"
                >
                  No se encontraron preguntas.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                >
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block font-medium text-slate-900 dark:text-slate-100">
                          {item.question}
                        </span>
                        <span className="line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.answer}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {item.categoryName || "Sin categoría"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={`${
                        item.isActive
                          ? "border-transparent bg-green-100 text-green-700 shadow-none hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          : "border-transparent bg-slate-100 text-slate-700 shadow-none hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.isActive ? "Publicado" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/faqs/${item.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 dark:text-slate-400"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
