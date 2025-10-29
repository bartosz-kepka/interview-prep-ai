import { test, expect } from '@playwright/test';
import { LoginPage } from './pom/LoginPage';
import { AIGeneratorPage } from './pom/AIGeneratorPage';

// UWAGA: Zastąp poniższe dane rzeczywistymi danymi użytkownika testowego
// lub skonfiguruj zmienne środowiskowe.
const TEST_USER_EMAIL = process.env.E2E_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.E2E_PASSWORD || 'password123';

const JOB_DESCRIPTION = `
As a Senior Frontend Developer at [Company Name], you will be responsible for building and maintaining 
our user-facing web applications. You will work closely with our design and product teams to implement 
new features, improve existing ones, and ensure a seamless user experience.

Responsibilities:
- Develop and maintain responsive web applications using React and TypeScript.
- Collaborate with UI/UX designers to translate wireframes and mockups into high-quality code.
- Optimize applications for maximum speed and scalability.
- Write clean, maintainable, and well-documented code.
- Participate in code reviews to maintain code quality and share knowledge.

Requirements:
- 5+ years of professional experience in frontend development.
- Strong proficiency in JavaScript, TypeScript, and React.
- Experience with state management libraries (e.g., Redux, Zustand).
- Familiarity with modern frontend build pipelines and tools (e.g., Webpack, Vite).
- Excellent problem-solving skills and attention to detail.
`;

test.describe('AI-01: AI Question Generator', () => {
  let loginPage: LoginPage;
  let aiGeneratorPage: AIGeneratorPage;

  test.beforeEach(async ({ page }) => {
    // Step 1: Login
    loginPage = new LoginPage(page);
    await loginPage.goto({ redirectTo: '/generator' });
    await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);

    // Wait for successful login and redirection to the generator page
    await expect(page).toHaveURL('/generator');

    aiGeneratorPage = new AIGeneratorPage(page);
  });

  test('should generate questions for a valid job description', async ({ page }) => {
    // Step 2: Fill the form and click generate
    await aiGeneratorPage.generatorInputForm.generateQuestions(JOB_DESCRIPTION);

    // Step 3: Verify loading state
    await expect(aiGeneratorPage.generatorInputForm.submitButton).toBeDisabled();
    await expect(aiGeneratorPage.generatorInputForm.submitButton).toHaveText('Generating...');

    // Step 4: Verify that the generated questions list appears
    await expect(aiGeneratorPage.generatedQuestionsList.listContainer).toBeVisible({ timeout: 90000 }); // Increased timeout for AI generation

    const questionItems = await aiGeneratorPage.generatedQuestionsList.questionItems.all();
    expect(questionItems.length).toBeGreaterThan(0);

    // Step 5: Verify the content of the first question
    const firstQuestionItem = aiGeneratorPage.generatedQuestionsList.getQuestionItem(0);
    const questionTextarea = aiGeneratorPage.generatedQuestionsList.getQuestionTextarea(firstQuestionItem);

    await expect(questionTextarea).not.toBeEmpty();
  });
});

