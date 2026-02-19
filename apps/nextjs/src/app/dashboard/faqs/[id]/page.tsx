"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useTRPC } from "~/trpc/react";
import { FaqForm } from "../_components/faq-form";

export default function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const api = useTRPC();
  const { data: item, isLoading } = useQuery(
    api.faq.getItemById.queryOptions({ id }),
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        Pregunta no encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Editar Pregunta
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Modifica el contenido de la pregunta frecuente.
        </p>
      </div>
      <FaqForm
        initialData={{
          ...item,
          keywords: item.keywords ?? undefined,
        }}
      />
    </div>
  );
}
