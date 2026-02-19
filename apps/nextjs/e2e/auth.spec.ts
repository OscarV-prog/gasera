import { expect, test } from "@playwright/test";

test.describe("Gasera Authentication & Dashboard Flow", () => {
  test("Should complete full auth cycle: Register -> Dashboard -> Logout", async ({
    page,
  }) => {
    // 1. Register new user
    await page.goto("/");
    await page.getByRole("button", { name: "Regístrate aquí" }).click();

    const randomId = Math.random().toString(36).substring(7);
    const email = `test-${randomId}@gasera.mx`;
    const name = `Test User ${randomId}`;

    await page.getByLabel("Nombre Completo").fill(name);
    await page.getByLabel("Correo Electrónico").fill(email);
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: "Registrarse" }).click();

    // 2. Verify Redirect to Dashboard
    // Wait for URL to change to /dashboard or /orders (loading state might take a moment)
    await page.waitForURL(/\/dashboard|\/orders/, { timeout: 60000 });

    // 3. Verify Dashboard Content
    // Should see the Sidebar with "Dashboard" link
    await expect(
      page.getByRole("link", { name: "Dashboard" }).first(),
    ).toBeVisible({ timeout: 10000 });

    // Should see the User Dropdown with the name
    await expect(
      page
        .getByRole("button")
        .filter({ hasText: name.charAt(0).toUpperCase() }),
    ).toBeVisible();

    // 4. Logout Flow
    // Open user menu
    await page
      .getByRole("button")
      .filter({ hasText: name.charAt(0).toUpperCase() })
      .click();

    // Click Sign Out
    await page.getByText("Cerrar Sesión").click();

    // 5. Verify Redirect back to Login
    await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Gasera" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar Sesión" }),
    ).toBeVisible();
  });
});
