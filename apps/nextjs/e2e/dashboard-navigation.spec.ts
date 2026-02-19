import { expect, test } from "@playwright/test";

test.describe("Dashboard Navigation & Error Check", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login/Register to get a valid session
    await page.goto("/");

    // Check if we need to register or login. For simplicity in this test environment,
    // we'll register a new user to ensure a clean state, similar to auth.spec.ts
    // In a real env, we might use a seed user.
    await page.getByRole("button", { name: "Regístrate aquí" }).click();

    const randomId = Math.random().toString(36).substring(7);
    const email = `test-nav-${randomId}@gasera.mx`;
    const name = `Test Nav User ${randomId}`;

    await page.getByLabel("Nombre Completo").fill(name);
    await page.getByLabel("Correo Electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: "Registrarse" }).click();

    // Wait for Dashboard
    await page.waitForURL(/\/dashboard|\/orders/, { timeout: 60000 });
  });

  const routes = [
    { name: "Inicio", href: "/dashboard" },
    { name: "Clientes", href: "/dashboard/customers" },
    { name: "Choferes", href: "/dashboard/drivers" },
    { name: "Reportes de Clientes", href: "/dashboard/reports/customers" },
    { name: "Reportes de Choferes", href: "/dashboard/reports/drivers" },
    { name: "Soporte Técnico", href: "/dashboard/support/contacts" },
    { name: "App Info", href: "/dashboard/app-info" },
    { name: "Unidades", href: "/dashboard/units" },
    { name: "Pedidos", href: "/dashboard/orders" },
    { name: "Programación del día", href: "/dashboard/scheduling" },
    { name: "Entregas", href: "/dashboard/deliveries" },
    { name: "Productos", href: "/dashboard/products" },
    { name: "Mensajería", href: "/dashboard/messages" },
    { name: "Facturación", href: "/dashboard/operations/billing" },
    { name: "Preguntas Frecuentes", href: "/dashboard/faqs" },
    // Reportes maps to /dashboard/reports but might redirect or show list
    { name: "Reportes", href: "/dashboard/reports" },
  ];

  for (const route of routes) {
    test(`Should load ${route.name} (${route.href}) without errors`, async ({
      page,
    }) => {
      console.log(`Navigating to: ${route.href}`);
      await page.goto(route.href);

      // Allow some time for data fetching
      await page.waitForLoadState("networkidle");

      // 1. Check for Common Error Texts
      const errorTexts = [
        "Internal Server Error",
        "Tenant ID is required",
        "An error occurred",
        "Error:",
        "Application Error", // Add specific error texts if known
      ];

      for (const errorText of errorTexts) {
        const errorVisible = await page
          .getByText(errorText, { exact: false })
          .isVisible();
        if (errorVisible) {
          // Capture screenshot if error found
          await page.screenshot({
            path: `test-results/error-${route.name.replace(/\s+/g, "-")}.png`,
          });
        }
        expect(
          errorVisible,
          `Found error "${errorText}" on page ${route.href}`,
        ).toBeFalsy();
      }

      // 2. Check key elements are visible (generic check)
      // Usually look for a heading or the sidebar
      await expect(page.locator("h1").first()).toBeVisible();

      // 3. Verify URL matches (handling redirects if any, but strictly should match)
      expect(page.url()).toContain(route.href);
    });
  }
});
