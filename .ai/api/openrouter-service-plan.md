# OpenRouter Service Implementation Guide

This document provides a comprehensive guide for implementing the `OpenRouterService`, which will act as a client for the OpenRouter.ai API to facilitate interactions with various Large Language Models (LLMs).

## 1. Service Description

The `OpenRouterService` is a TypeScript class designed to abstract the complexity of communicating with the OpenRouter API. Its primary responsibility is to construct and send chat completion requests, handle structured JSON responses, and manage API-related errors. It will be used within the `generation.service.ts` to replace the current mocked implementation, enabling real AI-powered question generation.

The service will be configurable, allowing developers to specify the model, system prompt, and other parameters on a per-request basis. It will leverage Zod for robust validation of the structured data returned by the LLM.

## 2. Constructor Description

The service's constructor will initialize a new instance with the necessary configuration to authenticate with the OpenRouter API.

```typescript
class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  /**
   * @param apiKey The API key for OpenRouter.
   * @throws {Error} if the API key is not provided.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenRouter API key is required.');
    }
    this.apiKey = apiKey;
  }
}
```

**Usage:** The service should be instantiated where needed, for example, inside an Astro API route or another service, by retrieving the key from environment variables.

```typescript
// Example in an Astro API route or service
import { OpenRouterService } from '@/lib/ai/openrouter.service';

const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
const openRouterService = new OpenRouterService(openRouterApiKey);
```

## 3. Public Methods and Fields

The service will expose one primary public method for generating structured content.

### `generateStructuredResponse<T extends z.ZodTypeAny>(options: GenerateOptions<T>): Promise<z.infer<T>>`

This method sends a request to the OpenRouter API and returns a validated, structured JSON object that conforms to the provided Zod schema.

**Parameters (`GenerateOptions<T>`):**

-   `systemMessage` (string): The system prompt to guide the model's behavior.
-   `userMessage` (string): The user's input or query.
-   `schema` (T): A Zod schema (`z.object(...)`) that defines the expected structure of the JSON response.
-   `model` (string, optional): The name of the model to use (e.g., `"anthropic/claude-3.5-sonnet"`). Defaults to a project-wide standard.
-   `params` (object, optional): Additional model parameters like `temperature`, `max_tokens`, etc.

**Returns:** A `Promise` that resolves to an object of the type inferred from the provided Zod schema.

**Example Usage:**

```typescript
import { z } from 'zod';

const QuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The generated interview question.'),
    })
  ),
});

const response = await openRouterService.generateStructuredResponse({
  systemMessage: 'You are an expert interviewer. Generate technical questions based on the user\'s input.',
  userMessage: 'The user has experience with React and PostgreSQL.',
  schema: QuestionsSchema,
  model: 'anthropic/claude-3.5-sonnet',
});

// `response` is now a typesafe object: { questions: [{ question: string }] }
```

## 4. Private Methods and Fields

The service will use private methods to encapsulate implementation details.

### `_buildPayload<T extends z.ZodTypeAny>(options: GenerateOptions<T>): object`

This private method will be responsible for constructing the final request body to be sent to the OpenRouter API. It will integrate the system message, user message, and the JSON schema for structured output.

**Functionality:**

1.  **System Message:** The `systemMessage` will be placed in the `messages` array as the first object with `role: 'system'`.
2.  **User Message:** The `userMessage` will follow as the second object with `role: 'user'`.
3.  **Structured Response Format (`response_format`):** The Zod schema will be converted into a JSON schema and embedded in the `response_format` field. This forces the model to return valid JSON.
    -   The format will be: `{ type: 'json_schema', json_schema: { name: 'structured_response', strict: true, schema: [zod-to-json-schema-output] } }`
4.  **Model and Parameters:** The `model` name and any additional `params` will be added to the top level of the payload.

### `_fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response>`

A helper method to make `fetch` requests with a configurable timeout to prevent long-running requests from hanging the application.

## 5. Error Handling

The service must implement robust error handling for all foreseeable issues. Errors originating from the service should be instances of custom error classes defined in `src/lib/errors.ts` (e.g., `BadGatewayError`, `InternalServerError`).

**Potential Error Scenarios:**

1.  **API Key Missing:** The constructor will throw a standard `Error` if the API key is not provided.
2.  **Network Errors:** Issues like timeouts or connectivity problems during the `fetch` call. The service should catch these and throw a `BadGatewayError` with a descriptive message.
3.  **OpenRouter API Errors:** The API may return non-200 status codes (e.g., 401 Unauthorized, 429 Rate Limit Exceeded, 500 Server Error). The service should parse the error response from OpenRouter and wrap it in a `BadGatewayError`.
4.  **Invalid JSON Response:** The model might fail to produce valid JSON despite the `response_format` instruction. The service should catch the `JSON.parse()` error and throw an `InternalServerError`.
5.  **Zod Validation Failure:** The model's JSON output may not conform to the provided Zod schema. The service should catch the Zod validation error and throw an `InternalServerError`, logging the validation issues for debugging.

## 6. Security Considerations

1.  **API Key Management:** The `OPENROUTER_API_KEY` must be stored securely as an environment variable and should never be hardcoded or exposed to the client-side. Use Astro's `import.meta.env` for server-side access.
2.  **Input Sanitization:** While the service itself doesn't perform sanitization, the calling context (e.g., the API route) should ensure that user-provided input is validated before being passed to the `generateStructuredResponse` method to prevent prompt injection attacks.
3.  **Denial of Service (DoS):** Implement rate limiting on the API endpoints that use this service to prevent abuse. Astro middleware is a suitable place for this. Also, set a reasonable timeout for API requests to avoid tying up server resources.

## 7. Step-by-Step Implementation Plan

**File Location:** `src/lib/ai/openrouter.service.ts`

**Step 1: Install Dependencies**

Install the `zod-to-json-schema` library to convert Zod schemas into the JSON Schema format required by the OpenRouter API. This is crucial for enforcing structured responses from the LLM.

**Step 2: Create the Service File and Class Skeleton**

Create the file `src/lib/ai/openrouter.service.ts`. Define the `OpenRouterService` class structure, including its constructor for API key injection and the public-facing `generateStructuredResponse` method. Also, define the `GenerateOptions` interface for type safety.

**Step 3: Implement the Private `_buildPayload` Method**

Implement a private method to construct the request body sent to the OpenRouter API. This method will be responsible for assembling the system message, user message, model parameters, and, most importantly, converting the Zod schema into the `response_format` JSON schema required by the API.

**Step 4: Implement the `generateStructuredResponse` Method**

Flesh out the main public method. This involves calling the private `_buildPayload` method, making the `fetch` request to the OpenRouter `/chat/completions` endpoint, and handling the full lifecycle of the response. This includes parsing the response body, extracting the JSON content from the message, and validating it against the provided Zod schema. Robust error handling for API failures, network issues, and validation errors is critical here.

**Step 5: Integrate the Service into `generation.service.ts`**

Refactor the `generation.service.ts` file to replace the mocked AI implementation. Instantiate the `OpenRouterService` with the API key from environment variables. Call the `generateStructuredResponse` method with the appropriate system prompt, user input (source text), and the `QuestionsSchema` to get real AI-generated questions. Ensure the response and any potential errors are handled correctly within the existing logging and error-handling structure.
