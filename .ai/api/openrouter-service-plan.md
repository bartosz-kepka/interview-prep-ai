# OpenRouter Service Implementation Guide

This document provides a comprehensive guide for implementing the OpenRouter service, which will act as a dedicated client for interacting with the OpenRouter API to handle LLM chat completions.

## 1. Service Description

The `OpenRouterService` will be a TypeScript class responsible for all communication with the OpenRouter API. It will encapsulate the logic for building requests, sending them to the API, and parsing the responses. The service will be designed to be reusable and configurable, allowing different parts of the application to leverage various LLM models with structured outputs. It will handle API key management, error handling, and request/response formatting according to the OpenRouter API specification.

## 2. Constructor

The service will be initialized with the OpenRouter API key. This key should be retrieved from environment variables to ensure it is not hardcoded.

### `constructor(apiKey: string)`

- **`apiKey`**: The API key for authenticating with the OpenRouter service.
- **Throws**: An `Error` if the `apiKey` is not provided, preventing the service from being instantiated in an invalid state.

**Example:**

```typescript
// src/lib/ai/openrouter.service.ts

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required.');
    }
    this.apiKey = apiKey;
  }

  // ... methods
}
```

## 3. Public Methods and Fields

### `async getChatCompletion<T>(options: OpenRouterRequest): Promise<T>`

This is the primary public method for the service. It sends a chat completion request to the OpenRouter API and returns the structured response.

- **`options`**: An `OpenRouterRequest` object containing all necessary parameters for the API call.
- **Returns**: A `Promise` that resolves to the parsed JSON response from the model, typed with the generic `T`.
- **Throws**: `OpenRouterError` for API-specific errors or standard `Error` for network/validation issues.

**Type Definitions:**

```typescript
// src/lib/ai/openrouter.types.ts

import { z } from 'zod';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JsonSchema {
  name: string;
  strict?: boolean;
  schema: object;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: JsonSchema;
}

export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  // Add other model parameters as needed
}

// Example Zod schema for a structured response
export const GeneratedQuestionsResponseSchema = z.array(z.string().describe('A generated interview question.'));

export type GeneratedQuestionsResponse = z.infer<typeof GeneratedQuestionsResponseSchema>;
```

## 4. Private Methods and Fields

### `private readonly apiKey: string`

Stores the OpenRouter API key.

### `private readonly baseUrl: string`

Stores the base URL for the OpenRouter API.

### `private validateRequest(options: OpenRouterRequest): void`

A private helper method to validate the request options before sending them to the API. It ensures that required fields like `model` and `messages` are present and correctly formatted.

## 5. Error Handling

The service must implement robust error handling to manage various failure scenarios gracefully. All errors originating from this service should be instances of a custom `OpenRouterError` class to allow for specific `catch` blocks.

### `OpenRouterError`

A custom error class that extends `Error`. It should include the HTTP status code and any error details returned by the API.

```typescript
// src/lib/errors.ts

export class OpenRouterError extends Error {
  constructor(
    public status: number,
    public errorResponse: object | string,
    message?: string
  ) {
    super(message || `OpenRouter API Error: Status ${status}`);
    this.name = 'OpenRouterError';
  }
}
```

### Error Scenarios:

1.  **Invalid API Key (401 Unauthorized)**: The service should throw an `OpenRouterError` with status 401.
2.  **Rate Limit Exceeded (429 Too Many Requests)**: The service should throw an `OpenRouterError` with status 429. This can be caught upstream to implement retry logic with exponential backoff.
3.  **Invalid Request (400 Bad Request)**: The service should throw an `OpenRouterError` with status 400, including the validation errors from the API response.
4.  **Server Error (5xx)**: The service should throw an `OpenRouterError` with the corresponding 5xx status code.
5.  **Network/Fetch Error**: The underlying `fetch` call might fail. This should be caught and re-thrown as a standard `Error` or a specific `NetworkError`.
6.  **JSON Parsing Error**: If the API response is not valid JSON or the model's output does not conform to the requested schema, the service should throw an error indicating a parsing failure.

## 6. Security Considerations

-   **API Key Management**: The OpenRouter API key is a sensitive secret. It **must not** be hardcoded in the source code. It should be loaded from environment variables (`import.meta.env.OPENROUTER_API_KEY`) on the server side.
-   **Input Sanitization**: While the primary inputs are controlled internally, any user-provided content that is passed into the `messages` array should be sanitized to prevent prompt injection attacks if applicable to the use case.
-   **Resource Limits**: Use model parameters like `max_tokens` to prevent unexpectedly large (and costly) responses.

## 7. Step-by-Step Implementation Plan

### Step 1: Create New Files

Create the following new files in the `src/lib/ai/` directory:

-   `src/lib/ai/openrouter.service.ts`
-   `src/lib/ai/openrouter.types.ts`

### Step 2: Define Types and Schemas

In `src/lib/ai/openrouter.types.ts`, define the interfaces and Zod schemas for requests and structured responses.

```typescript
// src/lib/ai/openrouter.types.ts

import { z } from 'zod';

// Interfaces for API interaction
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JsonSchema {
  name: string;
  strict?: boolean;
  schema: object;
}

export interface ResponseFormat {
  type: 'json_schema';
  json_schema: JsonSchema;
}

export interface OpenRouterRequest {
  model: string;
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
}

// Example Zod schema for a structured response
export const GeneratedQuestionsResponseSchema = z.array(z.string().describe('A generated interview question.'));

export type GeneratedQuestionsResponse = z.infer<typeof GeneratedQuestionsResponseSchema>;
```

### Step 3: Implement the `OpenRouterService` Class

In `src/lib/ai/openrouter.service.ts`, implement the service class.

```typescript
// src/lib/ai/openrouter.service.ts

import { OpenRouterError } from '../errors';
import type { OpenRouterRequest } from './openrouter.types';

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      // This will be caught server-side and should result in a 500 error.
      throw new Error('OpenRouter API key is not configured.');
    }
    this.apiKey = apiKey;
  }

  public async getChatCompletion<T>(options: OpenRouterRequest): Promise<T> {
    this.validateRequest(options);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());
      throw new OpenRouterError(response.status, errorData);
    }

    const data = await response.json();

    try {
      // The actual content from the model is in a stringified JSON inside the 'content' field
      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenRouter response.');
      }
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(`Failed to parse structured response from model: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
  }

  private validateRequest(options: OpenRouterRequest): void {
    if (!options.model) {
      throw new Error('Model is required.');
    }
    if (!options.messages || options.messages.length === 0) {
      throw new Error('Messages are required.');
    }
  }
}
```

### Step 4: Update Error Handling

Ensure the custom `OpenRouterError` is defined in `src/lib/errors.ts`.

```typescript
// src/lib/errors.ts

// ... any existing errors

export class OpenRouterError extends Error {
  constructor(
    public status: number,
    public errorResponse: object | string,
    message?: string
  ) {
    const defaultMessage = `OpenRouter API Error: Status ${status}. Response: ${JSON.stringify(errorResponse)}`;
    super(message || defaultMessage);
    this.name = 'OpenRouterError';
  }
}
```

### Step 5: Example Usage in an API Route

Modify an existing or create a new API route (e.g., `src/pages/api/ai/generate-questions.ts`) to use the new service.

```typescript
// src/pages/api/ai/generate-questions.ts

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { OpenRouterService } from '../../../lib/ai/openrouter.service';
import { GeneratedQuestionsResponseSchema, type ChatMessage } from '../../../lib/ai/openrouter.types';
import { OpenRouterError } from '../../../lib/errors';

// Input validation schema
const RequestBodySchema = z.object({
  job_title: z.string(),
  job_description: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  // 1. Validate Input
  const body = await request.json();
  const validation = RequestBodySchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: validation.error.flatten() }), { status: 400 });
  }

  const { job_title, job_description } = validation.data;

  // 2. Configure OpenRouter Request
  const systemMessage: ChatMessage = {
    role: 'system',
    content: 'You are an expert interviewer. Generate 5 technical interview questions based on the provided job title and description. Return the questions as a JSON array of strings.',
  };

  const userMessage: ChatMessage = {
    role: 'user',
    content: `Job Title: ${job_title}\nJob Description: ${job_description}`,
  };

  // Convert Zod schema to JSON schema for the model
  const jsonSchema = zodToJsonSchema(GeneratedQuestionsResponseSchema, 'GeneratedQuestions');

  // 3. Initialize and Use the Service
  try {
    const openRouter = new OpenRouterService(import.meta.env.OPENROUTER_API_KEY);

    const questionsResponse = await openRouter.getChatCompletion({
      model: 'anthropic/claude-3.5-sonnet', // Example model
      messages: [systemMessage, userMessage],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'GeneratedQuestions',
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    // 4. Validate the model's output against our Zod schema
    const parsedOutput = GeneratedQuestionsResponseSchema.safeParse(questionsResponse);

    if (!parsedOutput.success) {
        // This indicates the model failed to follow instructions
        return new Response(JSON.stringify({ error: 'Failed to get a valid response from the model.', details: parsedOutput.error.flatten() }), { status: 500 });
    }

    return new Response(JSON.stringify(parsedOutput.data), { status: 200 });

  } catch (error) {
    console.error(error);
    if (error instanceof OpenRouterError) {
      return new Response(JSON.stringify({ error: 'Error from AI service.', details: error.errorResponse }), { status: error.status });
    }
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
  }
};
```
This plan provides a clear path to creating a robust, secure, and maintainable service for interacting with the OpenRouter API, tailored to the project's existing tech stack and coding practices.
