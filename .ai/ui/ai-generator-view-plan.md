# View Implementation Plan: AI Generator

## 1. Overview

The AI Generator view enables users to generate interview questions from a job description or other text. Users can paste text into a textarea, trigger an AI generation process, review the proposed questions, edit them, and save the selected ones to their account. The view is designed to be responsive and user-friendly, providing clear feedback during loading, editing, and saving.

## 2. View Routing

The view will be accessible at the following path:

- **Path**: `/generator`

## 3. Component Structure

The view will be composed of the following React components, orchestrated within an Astro page (`src/pages/generator.astro`).

```
src/pages/generator.astro
└── src/components/views/AIGeneratorView.tsx (Client-side component)
    ├── src/components/ai/GeneratorInputForm.tsx
    │   ├── components/ui/Textarea.tsx
    │   ├── components/ui/Button.tsx
    │   └── (Character counter element)
    └── src/components/ai/GeneratedQuestionsList.tsx
        ├── (Select All/None Checkbox)
        ├── (List of GeneratedQuestionItem components)
        │   └── src/components/ai/GeneratedQuestionItem.tsx
        │       ├── components/ui/Checkbox.tsx
        │       ├── components/ui/Textarea.tsx (for question)
        │       └── components/ui/Textarea.tsx (for answer)
        └── components/ui/Button.tsx (Save Selected)
```

## 4. Component Details

### `AIGeneratorView`

- **Component Description**: The main container component that manages the overall state of the AI generation process. It orchestrates the input form and the list of generated questions. It will be a client-side component (`.tsx`).
- **Main Elements**: `GeneratorInputForm`, `GeneratedQuestionsList`. It will also render loading spinners or error messages based on the current state.
- **Handled Interactions**: Manages the state transition between generating, displaying results, and saving.
- **Validation Conditions**: None directly, but it passes state and handlers down to child components.
- **Types**: `GenerateQuestionsCommand`, `GenerateQuestionsResponseDto`, `SaveGeneratedQuestionsCommand`.
- **Props**: None.

### `GeneratorInputForm`

- **Component Description**: A form containing a textarea for the user to paste the job description and a button to start the generation process. It also displays a character counter.
- **Main Elements**: `Textarea`, `Button`.
- **Handled Interactions**:
  - Calls the `on_generate` handler with the `source_text` value when the "Generate" button is clicked.
  - Disables the button during the generation process.
- **Handled Validation**:
  - The "Generate" button is disabled if the `source_text` is empty or exceeds 10,000 characters.
- **Types**: None.
- **Props**:
  - `on_generate: (source_text: string) => void`
  - `is_generating: boolean`

### `GeneratedQuestionsList`

- **Component Description**: Displays the list of AI-generated questions. It includes a master checkbox to select/deselect all questions and a "Save" button. It manages the state of the question list internally.
- **Main Elements**: A "Select All" `Checkbox`, a list of `GeneratedQuestionItem` components, and a "Save Selected" `Button`.
- **Handled Interactions**:
  - Toggles the selection state of all questions.
  - Updates the state of individual questions (text, answer, selection).
  - Calls the `on_save` handler with the selected questions when the "Save Selected" button is clicked.
- **Handled Validation**:
  - The "Save Selected" button is disabled if no questions are selected.
- **Types**: `QuestionProposal[]`, `QuestionProposalViewModel`.
- **Props**:
  - `question_proposals: QuestionProposal[]`
  - `on_save: (questions: QuestionToSave[]) => void`
  - `is_saving: boolean`

### `GeneratedQuestionItem`

- **Component Description**: Represents a single generated question in the list. It contains a checkbox for selection and textareas for the question and answer, which are editable only when the item is selected.
- **Main Elements**: `Card`, `Checkbox`, two `Textarea` components.
- **Handled Interactions**:
  - Toggles the `selected` state of the question.
  - Updates the `question` or `answer` text in the parent component's state.
- **Handled Validation**:
  - The textareas for question and answer are disabled if the `selected` prop is `false`.
- **Types**: `QuestionProposalViewModel`.
- **Props**:
  - `question: QuestionProposalViewModel`
  - `on_question_update: (id: number, value: string) => void`
  - `on_answer_update: (id: number, value: string) => void`
  - `on_toggle_select: (id: number) => void`

## 5. Types

### `QuestionProposalViewModel`

This new ViewModel type is essential for managing the state of each question on the client-side. It extends the `QuestionProposal` from the API with UI-specific state.

```typescript
type QuestionProposal = {
  question: string;
};

type QuestionProposalViewModel = QuestionProposal & {
  id: number; // A temporary, client-side-only ID for list rendering (e.g., array index).
  answer: string; // The user's answer, initially empty.
  selected: boolean; // Whether the question is selected for saving. Defaults to true.
  original_question: string; // The original question text from the AI to check for edits.
};
```

## 6. State Management

A custom hook, `useAIGenerator`, will be created in `src/components/hooks/useAIGenerator.ts` to encapsulate the primary state and API logic for the view.

### `useAIGenerator` Hook

- **Purpose**: To manage the lifecycle of the AI generation and saving processes, including API calls and top-level state.
- **State Variables**:
  - `question_proposals: QuestionProposal[]`: The original list of proposals from the API.
  - `generation_log_id: string | null`: Stores the ID received from the generation API to be used for saving.
  - `status: 'idle' | 'generating' | 'success' | 'error' | 'saving'`: Tracks the current state of the view.
  - `error: string | null`: Stores any error messages.
- **Functions**:
  - `handle_generate(source_text: string)`: Calls the `/api/ai/generate-questions` endpoint.
  - `handle_save(questions: QuestionToSave[])`: Calls the `/api/ai/save-questions` endpoint.

## 7. API Integration

### Generate Questions

- **Action**: User clicks the "Generate" button.
- **Endpoint**: `POST /api/ai/generate-questions`
- **Request Type**: `GenerateQuestionsCommand`
  ```json
  { "source_text": "..." }
  ```
- **Response Type**: `GenerateQuestionsResponseDto`
  ```json
  {
    "generation_log_id": "uuid",
    "question_proposals": [{ "question": "..." }]
  }
  ```
- **Frontend Action**: On success, the `useAIGenerator` hook will store the `question_proposals` and `generation_log_id`, and set `status` to `'success'`.

### Save Questions

- **Action**: User clicks the "Save Selected" button.
- **Endpoint**: `POST /api/ai/save-questions`
- **Request Type**: `SaveGeneratedQuestionsCommand`
  ```json
  {
    "generation_log_id": "uuid",
    "questions": [
      {
        "question": "...",
        "edited": true,
        "answer": "..."
      }
    ]
  }
  ```
- **Response Type**: `SaveGeneratedQuestionsResponseDto`
  ```json
  { "saved_question_ids": ["uuid-1", "uuid-2"] }
  ```
- **Frontend Action**: On success, the user will be redirected to the main questions list page (`/`).

## 8. User Interactions

- **Pasting Text**: User pastes text into the main textarea. A character counter provides immediate feedback.
- **Generating**: User clicks "Generate". The button becomes disabled, and a loading indicator appears. The input form is replaced by the results list upon completion.
- **Selecting/Deselecting**: Users can click checkboxes on individual items or the "Select All" checkbox. Deselecting an item disables its textareas.
- **Editing**: Users can edit the question and answer text in the textareas for any selected item.
- **Saving**: User clicks "Save Selected". The button is disabled, and a saving indicator is shown. After a successful save, the user is redirected.

## 9. Conditions and Validation

- **Input Text**: The "Generate" button is disabled if the input textarea is empty or its content exceeds 10,000 characters.
- **Saving**: The "Save Selected" button is disabled if no questions are currently selected in the list.
- **Editing**: Textareas for a question and its answer are disabled if the question's checkbox is not checked.

## 10. Error Handling

- **Generation Failure**: If the `generate-questions` API call fails, a descriptive error message (e.g., "Failed to generate questions. Please try again.") will be displayed instead of the questions list.
- **Save Failure**: If the `save-questions` API call fails, an error message will be displayed near the "Save" button, and the `isSaving` state will be reset, allowing the user to try again.
- **Invalid Input**: Client-side validation prevents API calls with invalid input (e.g., empty `source_text`).

## 11. Implementation Steps

1.  **Create Astro Page**: Create the file `src/pages/generator.astro`. Import and render the main `AIGeneratorView` component, passing `client:load` to make it interactive.
2.  **Create `useAIGenerator` Hook**: Create `src/components/hooks/useAIGenerator.ts`. Implement the state variables and API handler functions (`handle_generate`, `handle_save`) as described in the State Management section.
3.  **Implement `AIGeneratorView`**: Create `src/components/views/AIGeneratorView.tsx`. Use the `useAIGenerator` hook. Conditionally render `GeneratorInputForm` or `GeneratedQuestionsList` based on the `status`. Pass the necessary props to children.
4.  **Implement `GeneratorInputForm`**: Create `src/components/ai/GeneratorInputForm.tsx`. Build the form with a `Textarea` and `Button`. Manage its own input state and call the `on_generate` prop on submit.
5.  **Implement `GeneratedQuestionsList`**: Create `src/components/ai/GeneratedQuestionsList.tsx`. It will receive `question_proposals` and manage its own `QuestionProposalViewModel[]` state internally. Implement the logic for selecting, editing, and saving, calling the `on_save` prop with the correct payload.
6.  **Implement `GeneratedQuestionItem`**: Create `src/components/ai/GeneratedQuestionItem.tsx`. Build the component UI with a `Card`, `Checkbox`, and two `Textarea` components. It should be a controlled component, calling its `on_*` props on user interaction.
7.  **Styling and Responsiveness**: Apply Tailwind CSS classes to all components to achieve the desired two-column responsive layout.
