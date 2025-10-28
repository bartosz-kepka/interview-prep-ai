import { type Page, type Locator } from '@playwright/test';

export class GeneratedQuestionsList {
  readonly page: Page;
  readonly listContainer: Locator;
  readonly saveButton: Locator;
  readonly questionItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.listContainer = page.locator('[data-test-id="generated-questions-list"]');
    this.saveButton = page.locator('[data-test-id="save-questions-button"]');
    this.questionItems = page.locator('[data-test-id="generated-question-item"]');
  }

  getQuestionItem(index: number) {
    return this.questionItems.nth(index);
  }

  getQuestionTextarea(item: Locator) {
    return item.locator('[data-test-id="question-textarea"]');
  }

  getAnswerTextarea(item: Locator) {
    return item.locator('[data-test-id="answer-textarea"]');
  }

  getSelectCheckbox(item: Locator) {
    return item.locator('[data-test-id="question-select-checkbox"]');
  }
}

