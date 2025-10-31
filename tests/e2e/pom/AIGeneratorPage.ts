import { type Page, type Locator } from "@playwright/test";
import { GeneratorInputForm } from "./GeneratorInputForm";
import { GeneratedQuestionsList } from "./GeneratedQuestionsList";

export class AIGeneratorPage {
  readonly page: Page;
  readonly generatorInputForm: GeneratorInputForm;
  readonly generatedQuestionsList: GeneratedQuestionsList;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.generatorInputForm = new GeneratorInputForm(page);
    this.generatedQuestionsList = new GeneratedQuestionsList(page);
    this.errorAlert = page.locator('[data-test-id="generator-error-alert"]');
  }

  async goto() {
    await this.page.goto("/generator");
  }
}
