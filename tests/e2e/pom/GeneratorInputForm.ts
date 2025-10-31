import { type Page, type Locator } from "@playwright/test";

export class GeneratorInputForm {
  readonly page: Page;
  readonly textarea: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.textarea = page.locator('[data-test-id="generator-input-textarea"]');
    this.submitButton = page.locator('[data-test-id="generator-submit-button"]');
  }

  async generateQuestions(text: string) {
    await this.textarea.fill(text);
    await this.submitButton.click();
  }
}
