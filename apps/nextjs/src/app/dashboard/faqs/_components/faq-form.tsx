"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

const faqFormSchema = z.object({
  question: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
  answer: z.string().min(10, "La respuesta debe tener al menos 10 caracteres"),
  categoryId: z.string().min(1, "Debes seleccionar una categoría"),
  keywords: z.string().optional(),
  isFeatured: z.boolean(),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

interface FaqFormProps {
  initialData?: FaqFormValues & { id: string };
}

export function FaqForm({ initialData }: FaqFormProps) {
  const router = useRouter();
  const api = useTRPC();

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          keywords: initialData.keywords || "",
          isFeatured: Boolean(initialData.isFeatured),
        }
      : {
          question: "",
          answer: "",
          categoryId: "",
          keywords: "",
          isFeatured: false,
        },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    api.faq.listCategories.queryOptions({ limit: 100 }),
  );

  const createMutation = useMutation(
    api.faq.createItem.mutationOptions({
      onSuccess: () => {
        toast.success("Pregunta creada correctamente");
        router.push("/dashboard/faqs");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const updateMutation = useMutation(
    api.faq.updateItem.mutationOptions({
      onSuccess: () => {
        toast.success("Pregunta actualizada correctamente");
        router.push("/dashboard/faqs");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    api.faq.deleteItem.mutationOptions({
      onSuccess: () => {
        toast.success("Pregunta eliminada");
        router.push("/dashboard/faqs");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (data: FaqFormValues) => {
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const onDelete = () => {
    if (initialData) {
      deleteMutation.mutate({ id: initialData.id });
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Pregunta</CardTitle>
            <CardDescription>
              Añade los detalles de la pregunta y su respuesta para el centro de
              ayuda.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Cargando..."
                              : "Selecciona una categoría"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.data?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Agrupa esta pregunta en una sección.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pregunta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="¿Cómo solicito una factura?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respuesta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explica detalladamente la solución..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabras Clave (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="factura, sat, xml, pdf" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ayuda a mejorar la búsqueda. Separa por comas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destacar</FormLabel>
                      <FormDescription>
                        Mostrar en la página principal del centro de ayuda.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t px-6 py-4">
            {initialData && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (confirm("¿Estás seguro de eliminar esta pregunta?")) {
                    onDelete();
                  }
                }}
                disabled={isLoading}
              >
                Eliminar
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Guardar Cambios" : "Crear Pregunta"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
