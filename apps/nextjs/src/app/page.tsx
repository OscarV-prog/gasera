"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Fuel, Lock, Mail, Moon, Sun, User } from "lucide-react";

import { authClient } from "@acme/auth/client";
import { Button, Input, Label, toast } from "@acme/ui";
import { useTheme } from "@acme/ui/theme";

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/dashboard",
        });
        if (error) {
          toast.error(error.message || "Error al registrarse");
        } else {
          toast.success("Cuenta creada exitosamente");
          router.push("/dashboard");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/dashboard",
        });
        if (error) {
          toast.error(error.message || "Credenciales inválidas");
        } else {
          toast.success("Bienvenido a Gasera");
          router.push("/dashboard");
        }
      }
    } catch (err) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-300 sm:px-6 lg:px-8">
      {/* Theme Toggle Button */}
      <div className="absolute top-8 right-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-full shadow-sm"
        >
          {!mounted ? (
            <div className="h-5 w-5" />
          ) : resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </Button>
      </div>

      <div className="animate-in fade-in zoom-in w-full max-w-md space-y-8 duration-500">
        {/* Branding */}
        <div className="flex flex-col items-center">
          <div className="bg-primary shadow-primary/20 ring-primary/10 flex h-20 w-20 items-center justify-center rounded-3xl shadow-2xl ring-4">
            <Fuel className="text-primary-foreground h-12 w-12" />
          </div>
          <h2 className="text-foreground mt-8 text-center text-5xl font-black tracking-tighter">
            Gasera
          </h2>
          <p className="text-muted-foreground mt-3 text-center text-sm font-medium tracking-widest uppercase">
            {isSignUp ? "Crea tu cuenta" : "Logística Inteligente"}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="border-border bg-card overflow-hidden rounded-3xl border shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="p-10">
            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-5">
                {isSignUp && (
                  <div className="animate-in slide-in-from-top-2 space-y-2 duration-300">
                    <Label
                      htmlFor="name"
                      className="text-muted-foreground pl-1 text-xs font-bold tracking-wider uppercase"
                    >
                      Nombre Completo
                    </Label>
                    <div className="group relative">
                      <User className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Juan Pérez"
                        className="border-border bg-muted/30 focus:bg-background focus:ring-primary/20 h-14 rounded-2xl pl-12 text-base transition-all focus:ring-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-muted-foreground pl-1 text-xs font-bold tracking-wider uppercase"
                  >
                    Correo Electrónico
                  </Label>
                  <div className="group relative">
                    <Mail className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@gasera.mx"
                      className="border-border bg-muted/30 focus:bg-background focus:ring-primary/20 h-14 rounded-2xl pl-12 text-base transition-all focus:ring-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <Label
                      htmlFor="password"
                      className="text-muted-foreground text-opacity-80 text-xs font-bold tracking-wider uppercase"
                    >
                      Contraseña
                    </Label>
                    {!isSignUp && (
                      <a
                        href="#"
                        className="text-primary text-xs font-bold underline-offset-4 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    )}
                  </div>
                  <div className="group relative">
                    <Lock className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="border-border bg-muted/30 focus:bg-background focus:ring-primary/20 h-14 rounded-2xl pl-12 text-base transition-all focus:ring-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:shadow-primary/25 relative h-14 w-full overflow-hidden rounded-2xl text-lg font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 h-5 w-5 animate-spin text-inherit"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <>
                    {isSignUp ? "Registrarse" : "Iniciar Sesión"}
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp
                  ? "¿Ya tienes cuenta?"
                  : "¿No tienes una cuenta?"}{" "}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-bold underline-offset-4 hover:underline"
              >
                {isSignUp ? "Inicia Sesión" : "Regístrate aquí"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-muted-foreground px-8 text-center text-xs leading-relaxed opacity-60">
          &copy; {new Date().getFullYear()} Gasera México S.A. de C.V. <br />
          Soporte Técnico: 01 800 GASERA
        </p>
      </div>
    </main>
  );
}
