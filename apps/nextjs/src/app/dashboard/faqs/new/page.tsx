import { FaqForm } from "../_components/faq-form";

export default function NewFaqPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Nueva Pregunta Frecuente
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Crea una nueva pregunta para el centro de ayuda.
        </p>
      </div>
      <FaqForm />
    </div>
  );
}
