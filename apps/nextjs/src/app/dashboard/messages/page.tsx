"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Mail, Plus, Search, Send, User } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@acme/ui";
import { toast } from "@acme/ui/toast";

import { useTRPC } from "~/trpc/react";

export default function MessagesPage() {
  const api = useTRPC();

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  // New Message State
  const [recipientId, setRecipientId] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const messagesQuery = useQuery(api.messages.list.queryOptions({ limit: 50 }));

  const recipientsQuery = useQuery(api.messages.getRecipients.queryOptions());

  const sendMessageMutation = useMutation(
    api.messages.send.mutationOptions({
      onSuccess: () => {
        toast.success("Mensaje enviado");
        setIsNewMessageOpen(false);
        setMessageContent("");
        setRecipientId("");
        void messagesQuery.refetch();
      },
      onError: (err: any) => {
        toast.error(`Error al enviar: ${err.message}`);
      },
    }),
  );

  const markReadMutation = useMutation(
    api.messages.markRead.mutationOptions({
      onSuccess: () => {
        void messagesQuery.refetch();
      },
    }),
  );

  const messagesData = messagesQuery.data;
  const isLoading = messagesQuery.isLoading;
  const recipients = recipientsQuery.data;

  const messages = useMemo(() => messagesData?.messages ?? [], [messagesData]);

  const selectedMessageData = useMemo(
    () => messages.find((m) => m.id === selectedMessage),
    [messages, selectedMessage],
  );

  const handleSelectMessage = (id: string, isRead: number) => {
    setSelectedMessage(id);
    if (isRead === 0) {
      markReadMutation.mutate({ messageId: id });
    }
  };

  const handleSendMessage = () => {
    if (!recipientId || !messageContent) return;
    sendMessageMutation.mutate({
      recipientId,
      content: messageContent,
    });
  };

  const unreadCount = messages.filter((m) => m.isRead === 0).length;
  // Count sent today based on created_at and isMe
  const sentTodayCount = messages.filter((m) => {
    if (!m.isMe) return false;
    const date = new Date(m.createdAt);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Mensajería
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Comunicación interna del equipo
          </p>
        </div>

        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Nuevo Mensaje</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Destinatario</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role}){/* {user.email} */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <Textarea
                  placeholder="Escribe tu mensaje aquí..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending
                    ? "Enviando..."
                    : "Enviar Mensaje"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                {unreadCount}
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
                {sentTodayCount}
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

            <div className="max-h-[600px] divide-y divide-gray-200 overflow-y-auto dark:divide-gray-800">
              {isLoading && (
                <div className="p-4 text-center text-gray-500">
                  Cargando mensajes...
                </div>
              )}
              {!isLoading && messages.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="mx-auto mb-2 h-8 w-8 text-gray-400 opacity-50" />
                  No hay mensajes
                </div>
              )}
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() =>
                    handleSelectMessage(message.id, message.isRead)
                  }
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedMessage === message.id
                      ? "bg-blue-50 dark:bg-blue-950"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            message.isRead === 0
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {message.isMe ? `Para: ${"..."}` : message.senderName}
                          {/* Note: In a real app we'd fetch recipient name for sent messages too, 
                               but for now let's just indicate it's sent by me or use senderName logic from backend */}
                          {message.isMe && (
                            <span className="ml-1 text-xs font-normal text-gray-400">
                              (Yo)
                            </span>
                          )}
                        </p>
                        {message.isRead === 0 && !message.isMe && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 truncate text-sm text-gray-500 dark:text-gray-400">
                        {message.content}
                      </p>
                    </div>
                    <p className="ml-2 text-xs whitespace-nowrap text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <div className="min-h-[400px] rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            {selectedMessageData ? (
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {/* We don't have subject in DB yet, using generic title or slice of content */}
                      Mensaje
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {selectedMessageData.senderName}
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>
                            {new Date(
                              selectedMessageData.createdAt,
                            ).toLocaleString("es-MX")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  <p>{selectedMessageData.content}</p>
                </div>

                <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <Button
                    onClick={() => {
                      setIsNewMessageOpen(true);
                      // Pre-fill logic could go here
                    }}
                  >
                    Responder
                  </Button>
                  <Button variant="outline">Reenviar</Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="mb-4 rounded-full bg-gray-50 p-4 dark:bg-gray-800">
                  <Mail className="h-8 w-8 text-gray-400" />
                </div>
                <p>Selecciona un mensaje para ver su contenido</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
