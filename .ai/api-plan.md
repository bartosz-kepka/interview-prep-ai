# REST API Plan

## 1. Resources

-   **Questions**: Represents the questions and answers created by users. Corresponds to the `questions` table.
-   **AI Question Generation**: Represents the process of generating questions from a job offer text using an AI service. This is a functional resource and does not map directly to a single table but orchestrates interactions between `ai_generation_logs` and the external AI service.

## 2. Endpoints

### Questions Resource

#### List Questions

-   **HTTP Method**: `GET`
-   **URL Path**: `/api/questions`
-   **Description**: Retrieves a paginated list of questions for the authenticated user, with options for sorting and searching.
-   **Query Parameters**:
    -   `page` (number, optional, default: 1): The page number for pagination.
    -   `page_size` (number, optional, default: 10): The number of items per page.
    -   `sort_by` (string, optional, default: 'created_at'): Field to sort by.
    -   `sort_order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').
    -   `search` (string, optional): A search term to filter questions by their content.
-   **JSON Response Payload**:
    ```json
    {
      "data": [
        {
          "id": "uuid",
          "question": "What is your greatest strength?",
          "answer": "My ability to learn quickly.",
          "source": "user",
          "created_at": "iso-8601-timestamp"
        }
      ],
      "pagination": {
        "page": 1,
        "page_size": 10,
        "total_items": 100,
        "total_pages": 10
      }
    }
    ```
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`

#### Create a Question

-   **HTTP Method**: `POST`
-   **URL Path**: `/api/questions`
-   **Description**: Creates a new question for the authenticated user.
-   **JSON Request Payload**:
    ```json
    {
      "question": "What is your greatest weakness?",
      "answer": "Public speaking."
    }
    ```
-   **JSON Response Payload**:
    ```json
    {
      "id": "uuid",
      "question": "What is your greatest weakness?",
      "answer": "Public speaking.",
      "source": "user",
      "created_at": "iso-8601-timestamp"
    }
    ```
-   **Success Codes**: `201 Created`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`

#### Get a Single Question

-   **HTTP Method**: `GET`
-   **URL Path**: `/api/questions/{question_id}`
-   **Description**: Retrieves a single question by its ID.
-   **JSON Response Payload**:
    ```json
    {
      "id": "uuid",
      "question": "What is your greatest strength?",
      "answer": "My ability to learn quickly.",
      "source": "user",
      "created_at": "iso-8601-timestamp",
      "updated_at": "iso-8601-timestamp"
    }
    ```
-   **Success Codes**: `200 OK`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`

#### Update a Question

-   **HTTP Method**: `PATCH`
-   **URL Path**: `/api/questions/{question_id}`
-   **Description**: Updates an existing question.
-   **JSON Request Payload**:
    ```json
    {
      "question": "What is your most significant achievement?",
      "answer": "Leading a successful project under a tight deadline."
    }
    ```
-   **JSON Response Payload**:
    ```json
    {
      "id": "uuid",
      "question": "What is your most significant achievement?",
      "answer": "Leading a successful project under a tight deadline.",
      "source": "user",
      "created_at": "iso-8601-timestamp",
      "updated_at": "iso-8601-timestamp"
    }
    ```
-   **Success Codes**: `200 OK`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`

#### Delete a Question

-   **HTTP Method**: `DELETE`
-   **URL Path**: `/api/questions/{question_id}`
-   **Description**: Deletes a question.
-   **Success Codes**: `204 No Content`
-   **Error Codes**: `401 Unauthorized`, `404 Not Found`

### AI Question Generation Resource

#### Generate Questions from Job Offer

-   **HTTP Method**: `POST`
-   **URL Path**: `/api/ai/generate-questions`
-   **Description**: Initiates the AI question generation process based on the provided job offer text. It creates a log entry, calls the external AI service, and returns the generated question proposals for user review.
-   **JSON Request Payload**:
    ```json
    {
      "source_text": "We are looking for a Senior Software Engineer with experience in React, Node.js, and PostgreSQL..."
    }
    ```
-   **JSON Response Payload**:
    ```json
    {
      "generation_log_id": "uuid",
      "question_proposals": [
        {
          "question": "Can you describe your experience with React and Node.js?"
        },
        {
          "question": "Tell us about a project where you used PostgreSQL."
        }
      ]
    }
    ```
-   **Success Codes**: `200 OK`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`, `500 Internal Server Error`, `502 Bad Gateway`

#### Save Generated Questions

-   **HTTP Method**: `POST`
-   **URL Path**: `/api/ai/save-questions`
-   **Description**: Saves the selected (and potentially edited) AI-generated questions to the user's account.
-   **JSON Request Payload**:
    ```json
    {
      "generation_log_id": "uuid",
      "questions": [
        {
          "question": "Can you describe your experience with React and modern JavaScript?",
          "edited": true,
          "answer": "I have been working with React for 5 years..."
        },
        {
          "question": "Tell us about a challenging project where you used PostgreSQL.",
          "edited": false,
          "answer": ""
        }
      ]
    }
    ```
-   **JSON Response Payload**:
    ```json
    {
      "saved_question_ids": ["uuid-1", "uuid-2"]
    }
    ```
-   **Success Codes**: `201 Created`
-   **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found` (if `generation_log_id` is invalid), `422 Unprocessable Entity`

## 3. Authentication and Authorization

-   **Mechanism**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Auth.
-   **Implementation**:
    1.  The client application will use the Supabase client library to handle user registration, login, and session management.
    2.  Upon successful login, Supabase provides a JWT.
    3.  For every request to the API, the client must include the JWT in the `Authorization` header as a Bearer token (`Authorization: Bearer <YOUR_SUPABASE_JWT>`).
    4.  Astro middleware on the server will intercept incoming requests, validate the JWT using Supabase's helper functions, and extract the user's identity.
    5.  The authenticated user's ID will be used to enforce Row-Level Security (RLS) policies at the database level, ensuring users can only access and modify their own data.
    6.  Endpoints that require authentication will return a `401 Unauthorized` error if the token is missing, invalid, or expired.

## 4. Validation and Business Logic

### Validation

-   **`POST /api/questions`** & **`PATCH /api/questions/{question_id}`**:
    -   `question`: Required, string, not blank, max 10,000 characters.
    -   `answer`: Optional, string, max 10,000 characters.
-   **`POST /api/ai/generate-questions`**:
    -   `source_text`: Required, string, not blank, max 10,000 characters.
-   **`POST /api/ai/save-questions`**:
    -   `generation_log_id`: Required, UUID format.
    -   `questions`: Required, array of objects.
        -   `question`: Required, string, not blank, max 10,000 characters.
        -   `edited`: Required, boolean.
        -   `answer`: Optional, string, max 10,000 characters.

Input validation will be performed in the API route handlers using `zod` before any database operations occur.

### Business Logic

-   **`GET /api/questions`**: Implements pagination, sorting by `created_at` (default) or other fields, and full-text search functionality using the `pg_trgm` index on the `question` column.
-   **`POST /api/questions`**: When a question is created manually, the `source` column is automatically set to `'user'`.
-   **`POST /ai/generate-questions`**:
    1.  Creates a record in `ai_generation_logs` with the user's ID and the prompt.
    2.  Sends the `source_text` to the external AI service (e.g., OpenRouter).
    3.  On a successful response from the AI, it updates the log entry with the raw response, `finished_at` timestamp, and `status: 'success'`.
    4.  On failure, it updates the log with `error_details`, `finished_at`, and `status: 'error'`.
    5.  Parses the AI response and returns a clean list of question proposals to the client.
-   **`POST /ai/save-questions`**:
    1.  Receives a list of questions and the `generation_log_id`.
    2.  Iterates through the list and creates a new record in the `questions` table for each item.
    3.  For each new question, it sets the `source` to `'ai'` or `'ai-edited'`, basing on the `edited` field, and links it to the original log via `generation_log_id`.
    4.  The `updated_at` trigger in the database will automatically manage the `updated_at` field for any updates to questions.
