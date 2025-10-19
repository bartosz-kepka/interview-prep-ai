# API Endpoint Implementation Plan: Generate Questions from Job Offer

## 1. Endpoint Overview
This document outlines the implementation plan for the `POST /api/ai/generate-questions` endpoint. Its purpose is to accept a job offer text from a user, leverage an external AI service to generate relevant interview questions (mock for now), and return these questions as proposals for the user to review. The entire process, including any errors, is logged for monitoring and auditing purposes.

## 2. Request Details
-   **HTTP Method**: `POST`
-   **URL Structure**: `/api/ai/generate-questions`
-   **Parameters**: None (all data is in the request body).
-   **Request Body**: The request body must be a JSON object conforming to the `GenerateQuestionsCommand` type.

    ```json
    {
      "source_text": "We are looking for a Senior Software Engineer with experience in React, Node.js, and PostgreSQL..."
    }
    ```
-   **Validation**:
    -   `source_text`: Required, `string`, must not be blank, maximum 10,000 characters.

## 3. Used Types
-   **Command Model**: `GenerateQuestionsCommand` from `src/types.ts` for the request payload.
-   **Response DTO**: `GenerateQuestionsResponseDto` from `src/types.ts` for the success response.
-   **Database Entity**: `TablesInsert<'ai_generation_logs'>` from `src/db/database.types.ts` for database operations.

## 4. Response Details
-   **Success (200 OK)**: Returns a JSON object with the ID of the generation log and an array of question proposals.
    ```json
    {
      "generation_log_id": "a1b2c3d4-...",
      "question_proposals": [
        { "question": "Can you describe your experience with React and Node.js?" },
        { "question": "Tell us about a project where you used PostgreSQL." }
      ]
    }
    ```
-   **Error**: Returns a standard JSON error object with a descriptive message.
    -   `400 Bad Request`: If input validation fails.
    -   `500 Internal Server Error`: For unexpected server-side issues (e.g., database connection failure).
    -   `502 Bad Gateway`: If the external AI service fails or returns an error.

## 5. Data Flow
1.  The client sends a `POST` request with the job offer text to `/api/ai/generate-questions`.
3.  The API route handler (`src/pages/api/ai/generate-questions.ts`) receives the request.
4.  It validates the request body using a Zod schema. If invalid, it returns a `400` error.
5.  It retrieves the Supabase client from `context.locals`.
6.  It calls the `generateQuestions` function in the `AiGenerationService` (`src/lib/ai/generation.service.ts`), passing the `source_text` and the DEV_USER_ID from `src/db/supabase.client.ts` as the user id.
7.  The service creates an initial record in the `ai_generation_logs` table with the user ID and the prompt.
8.  The service constructs a detailed prompt for the AI model and makes an API call to OpenRouter.
9.  **On AI Success**: The service parses the AI's response to extract the questions. It then updates the log entry with `status: 'success'`, the `finished_at` timestamp, and the raw AI response.
10. **On AI Failure**: The service catches the error, and updates the log entry with `status: 'error'`, the `finished_at` timestamp, and the `error_details`. It then throws an error that the API route will catch.
11. The API route receives the result from the service and sends the appropriate response to the client (`200 OK` on success, or a `5xx` error code on failure).

## 6. Security Considerations
-   **Authentication**: The endpoint will not contain authentication in this stage because authentication is not yet implemented. In the future, it will verify the user's identity via `context.locals.user`. For now, it will use a constant DEV_USER_ID.
-   **Authorization**: The RLS policies on the `ai_generation_logs` table ensure that users can only create and view their own log entries, preventing data leakage between users.
-   **Input Validation**: Strict validation of `source_text` via Zod mitigates risks associated with oversized payloads.
-   **Prompt Injection**: The system prompt sent to the AI will be engineered to be robust, instructing the model to strictly adhere to the task of generating questions and to ignore any conflicting instructions within the user-provided `source_text`.
-   **Secret Management**: The `OPENROUTER_API_KEY` will be stored securely as an environment variable and accessed via `import.meta.env`. It will not be exposed to the client.

## 7. Performance Considerations
-   **External API Latency**: The primary performance bottleneck will be the response time of the external AI service. The operation is asynchronous and its duration is outside of our direct control. The UI should reflect a loading state while awaiting the response.
-   **Database Writes**: The two database writes (initial log creation and final update) are lightweight and indexed, and should not pose a significant performance issue.

## 8. Implementation Steps
1. **Create New Files**:
    -   Create the API route file: `src/pages/api/ai/generate-questions.ts`.
    -   Create the service file for AI logic: `src/lib/ai/generation.service.ts`.
    -   Create a file for Zod validation schemas related to AI generation: `src/lib/ai/validation.ts`.

2. **Implement Input Validation**:
    -   In `src/lib/ai/validation.ts`, define a Zod schema for `GenerateQuestionsCommand` to validate `source_text` (required, string, min 1, max 10000).

3. **Implement the AI Service (`generation.service.ts`)**:
    -   Create a `generateQuestions` function that accepts `source_text`, `userId`, and a `SupabaseClient` instance.
    -   **Step 1: Create Log**: Insert a new record into `ai_generation_logs` with the `prompt` and `user_id`. Store the `generation_log_id` of the new record.
    -   **Step 2: Call AI**: Use `fetch` to make a `POST` request to the OpenRouter API. Construct a system prompt that instructs the AI to return a JSON array of question objects.
      - IMPORTANT: In this stage, mock the AI response for development purposes.
    -   **Step 3: Handle Response**:
        -   If the AI call is successful, parse the JSON response.
        -   Update the log record with `status: 'success'`, `finished_at`, and the raw `response`.
        -   Return the parsed question proposals and the log ID.
        -   If the AI call fails or returns an error, catch the exception.
        -   Update the log record with `status: 'error'`, `finished_at`, and `error_details`.
        -   Re-throw a custom error (e.g., `BadGatewayError`) to be handled by the API route.

4. **Implement the API Route (`generate-questions.ts`)**:
    -   Define an `POST` handler that takes `APIContext`.
    -   Parse and validate the request body using the Zod schema. If validation fails, return a `400` response.
    -   Wrap the call to the `AiGenerationService` in a `try...catch` block.
    -   On success, return a `200 OK` response with the `GenerateQuestionsResponseDto`.
    -   In the `catch` block, check the type of error thrown by the service and return the corresponding status code (`502` for AI failures, `500` for other unexpected errors).
    -   Ensure `export const prerender = false;` is set.