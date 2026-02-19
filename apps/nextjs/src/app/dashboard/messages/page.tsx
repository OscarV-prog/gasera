"use client";

import { useState } from "react";
import { Mail, Search, Send } from "lucide-react";

import { Button } from "@acme/ui";

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Mock data - esto se reemplazará con datos reales de tRPC
  const messages = [
    {
      id: "1",
      from: "Juan Pérez",
      subject: "Retraso en entrega",
      preview: "Hola, tengo un retraso de 15 minutos debido al tráfico...",
      timestamp: "2026-02-13T11:30:00",
      read: false,
    },
    {
      id: "2",
      from: "María González",
      subject: "Confirmación de entrega",
      preview: "Cliente confirmó recepción de 10 cilindros de 30kg...",
      timestamp: "2026-02-13T10:15:00",
      read: true,
    },
    {
      id: "3",
      from: "Carlos Rodríguez",
      subject: "Problema con unidad",
      preview: "La unidad ABC-123 presenta falla en el motor...",
      timestamp: "2026-02-13T09:00:00",
      read: false,
    },
    {
      id: "4",
      from: "Ana Martínez",
      subject: "Solicitud de día libre",
      preview: "Solicito permiso para el día 15 de febrero...",
      timestamp: "2026-02-12T16:45:00",
      read: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Mensajería
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Comunicación interna del equipo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Mensajes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {messages.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950">
              <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No Leídos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {messages.filter((m) => !m.read).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-950">
              <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enviados Hoy
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                12
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mensajes..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedMessage === message.id
                      ? "bg-blue-50 dark:bg-blue-950"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !message.read
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {message.from}
                        </p>
                        {!message.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {message.subject}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {message.preview}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleString("es-MX")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {selectedMessage ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {messages.find((m) => m.id === selectedMessage)?.subject}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    De: {messages.find((m) => m.id === selectedMessage)?.from}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(
                      messages.find((m) => m.id === selectedMessage)
                        ?.timestamp || "",
                    ).toLocaleString("es-MX")}
                  </span>
                </div>
                <div className="mt-6 text-gray-700 dark:text-gray-300">
                  <p>
                    {messages.find((m) => m.id === selectedMessage)?.preview}
                  </p>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button>Responder</Button>
                  <Button variant="outline">Reenviar</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                Selecciona un mensaje para ver su contenido
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
