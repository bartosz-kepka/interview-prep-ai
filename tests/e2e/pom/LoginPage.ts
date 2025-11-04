import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-test-id="login-email-input"]');
    this.passwordInput = page.locator('[data-test-id="login-password-input"]');
    this.submitButton = page.locator('[data-test-id="login-submit-button"]');
    this.errorAlert = page.locator('[data-test-id="login-api-error-alert"]');
  }

  async goto(options?: { redirectTo?: string }) {
    const url = options?.redirectTo ? `/login?redirect=${encodeURIComponent(options.redirectTo)}` : "/login";
    await this.page.goto(url, { waitUntil: "networkidle" });
  }

  async login(email: string, password?: string) {
    // Wait for the submit button to be enabled, which indicates that the
    // form is fully hydrated and ready for interaction.
    await this.submitButton.waitFor({ state: "attached" });

    await this.emailInput.fill(email);
    if (password) {
      await this.passwordInput.fill(password);
    }
    await this.submitButton.click();
    await this.page.waitForLoadState("networkidle");
  }
}
