"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@acme/auth/client";
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
  toast,
} from "@acme/ui";

import { useTRPC } from "~/trpc/react";

// --- Profile Schema ---
const profileFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// --- Password Schema ---
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface ProfileFormProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const api = useTRPC();

  // --- Profile Form State ---
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
    },
  });

  const updateProfileMutation = useMutation(
    api.user.updateProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Perfil actualizado correctamente");
        router.refresh();
      },
      onError: (error) => {
        toast.error("Error al actualizar perfil: " + error.message);
      },
    }),
  );

  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  // --- Password Form State ---
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsPasswordLoading(true);
    try {
      await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Contraseña actualizada correctamente");
            passwordForm.reset();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Error al cambiar contraseña");
          },
        },
      });
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsPasswordLoading(false);
    }
  }

  const isProfileLoading = updateProfileMutation.isPending;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* --- Profile Section --- */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu nombre y correo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-9"
                          placeholder="Tu nombre"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-9"
                          placeholder="nombre@empresa.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {/* --- Password Section --- */}
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Cambia tu contraseña.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                        <Input
                          className="pl-9"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nueva Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-slate-50/50 px-6 py-4 dark:bg-slate-900/50">
              <Button
                type="submit"
                variant="outline"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Actualizar
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
