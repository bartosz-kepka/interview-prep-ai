# API Endpoint Implementation Plan: `POST /api/ai/save-questions`

## 1. Endpoint Overview

This endpoint saves AI-generated questions to the user's account. It receives a `generation_log_id` and a list of questions that may have been edited by the user. The endpoint validates the input, creates new records in the `questions` table with the appropriate `source` (`ai` or `ai-edited`), and links them to the original generation log. For now, it mocks the user authentication by using a constant `DEV_USER_ID`. In the future, it will retrieve the authenticated user's ID from `context.locals.user`.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/ai/save-questions`
- **Request Body**: The request body must be a JSON object with the following structure:
  ```json
  {
    "generation_log_id": "uuid",
    "questions": [
      {
        "question": "string",
        "edited": "boolean",
        "answer": "string"
      }
    ]
  }
  ```
- **Parameters**:
  - **Required**:
    - `generation_log_id` (UUID): The identifier for the AI generation log.
    - `questions` (Array): An array of question objects to be saved. Must contain at least one item.
    - `question.question` (string): The text of the question (1-10,000 characters).
    - `question.edited` (boolean): A flag indicating if the user modified the question.
  - **Optional**:
    - `question.answer` (string): The user's answer to the question (max 10,000 characters).

## 3. Used Types

- **Command Model**: `SaveGeneratedQuestionsCommand` will be used to type the incoming request body.
- **Response DTO**: `SaveGeneratedQuestionsResponseDto` will be used to structure the successful response payload.
- **Validation Schema**: A `zod` schema will be created to validate the `SaveGeneratedQuestionsCommand`.
- **Database Model**: `TablesInsert<'questions'>` will be used for creating new records in the database.

## 4. Response Details

- **Success (201 Created)**: On successful creation of questions, the response will be a JSON object containing the IDs of the saved questions.
  ```json
  {
    "saved_question_ids": ["uuid-1", "uuid-2"]
  }
  ```
- **Error**:
  - `400 Bad Request`: Invalid request body structure or content.
  - `404 Not Found`: The specified `generation_log_id` does not exist or does not belong to the user.
  - `422 Unprocessable Entity`: A database error occurred during the save operation.
  - `500 Internal Server Error`: Unexpected server error.

## 5. Data Flow

1.  The API route handler at `/api/ai/save-questions.ts` receives a `POST` request.
2.  The request body is parsed and validated against a `zod` schema. If validation fails, a `400 Bad Request` error is returned.
3.  The validated data (`SaveGeneratedQuestionsCommand`) and the `DEV_USER_ID` are passed to the `saveGeneratedQuestions` function in `src/lib/services/questions.service.ts`.
4.  The service function first queries the `ai_generation_logs` table to confirm the `generation_log_id` exists and belongs to the user. If not, it throws a `NotFoundError`.
5.  The service then maps the array of questions from the command to an array of `TablesInsert<'questions'>` objects, setting the `user_id`, `generation_log_id`, and `source` ('ai' or 'ai-edited') for each.
6.  It executes a bulk `insert()` operation on the `questions` table using the Supabase client.
7.  If the insertion is successful, the service returns the IDs of the newly created questions.
8.  The API route handler catches any errors from the service and maps them to the appropriate HTTP status codes (`404`, `422`).
9.  On success, the handler returns a `201 Created` response with the `SaveGeneratedQuestionsResponseDto`.

## 6. Security Considerations

- **Authentication**: The endpoint will not contain authentication in this stage because authentication is not yet implemented. In the future, it will verify the user's identity via `context.locals.user`. For now, it will use a constant DEV_USER_ID.
- **Authorization**: Business logic within the `questions.service` will ensure that the `generation_log_id` belongs to the authenticated user, preventing any cross-user data association.
- **Data Validation**: `zod` will be strictly used to validate all incoming data for correct types, formats (UUID), and constraints (string length, non-empty arrays), preventing invalid data from reaching the database.
- **Database Security**: All database operations will rely on Supabase's Row-Level Security (RLS) policies as a secondary line of defense, ensuring users can only interact with their own data.

## 7. Performance Considerations

- **Bulk Insertion**: To minimize database round-trips and improve performance, all questions will be inserted in a single bulk `insert()` operation rather than individually in a loop.
- **Payload Size**: The request payload is constrained by the `max` length on `question` and `answer` fields, which helps prevent excessively large requests from overwhelming the server.

## 8. Implementation Steps

1.  **Create Service File**: Create a new file `src/lib/services/questions.service.ts`.
2.  **Implement `saveGeneratedQuestions` Service**:
    - Define an arrow function `saveGeneratedQuestions` that accepts `(supabase: SupabaseClient, userId: string, command: SaveGeneratedQuestionsCommand)`.
    - Inside the function, first, perform a `select` query on `ai_generation_logs` to verify the `generation_log_id` exists for the given `userId`. If not, throw a `NotFoundError`.
    - Map the `command.questions` array to a new array suitable for `TablesInsert<'questions'>`. For each question, set `user_id`, `generation_log_id`, and determine the `source` based on the `edited` flag.
    - Use `supabase.from('questions').insert([...]).select('id')` to perform a bulk insert and return the new IDs.
    - Handle potential database errors from the insert operation and throw an `UnprocessableEntityError`.
    - Return the array of saved question IDs.
3.  **Create API Route File**: Create a new file `src/pages/api/ai/save-questions.ts`.
4.  **Implement API Route Handler**:
    - Define an `APIRoute` handler for the `POST` method.
    - Ensure `export const prerender = false;` is set.
    - Define the `zod` schema for `SaveGeneratedQuestionsCommand` and parse the request body. Use a `try...catch` block to handle parsing errors and return a `400` response.
    - Call the `saveGeneratedQuestions` service function with the Supabase client from `context.locals`, DEV_USER_ID, and the validated command.
    - Use a `try...catch` block to handle specific errors (`NotFoundError`, `UnprocessableEntityError`) thrown from the service and return the corresponding `404` or `422` status codes.
    - On success, return a `201 Created` response with the `saved_question_ids`.
5.  **Update Type Definitions**: Ensure the `SaveGeneratedQuestionsCommand` and `SaveGeneratedQuestionsResponseDto` types in `src/types.ts` are correctly defined and exported as per the specification.
