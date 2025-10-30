import { z, ZodError } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { BadGatewayError, InternalServerError } from '../errors';

interface GenerateOptions<T extends z.ZodTypeAny> {
  systemMessage: string;
  userMessage: string;
  schema: T;
  model?: string;
  params?: Record<string, any>;
}

const DEFAULT_MODEL = 'x-ai/grok-code-fast-1';

export class OpenRouterService {
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

  public async generateStructuredResponse<T extends z.ZodTypeAny>(options: GenerateOptions<T>): Promise<z.infer<T>> {
    const payload = this._buildPayload(options);

    let response: Response;
    try {
      response = await this._fetchWithTimeout(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }, 30000);
    } catch (error) {
      throw new BadGatewayError(`Failed to communicate with OpenRouter API: ${error.message}`);
    }

    if (!response.ok) {
      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = `OpenRouter API error: ${errorData.error.message}`;
        }
      } catch {
        // Ignore JSON parse errors for error response
      }
      throw new BadGatewayError(errorMessage);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      throw new InternalServerError('Failed to parse JSON response from OpenRouter API');
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new InternalServerError('Invalid response from OpenRouter API: missing content');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new InternalServerError('Failed to parse JSON content from OpenRouter API response');
    }

    try {
      return options.schema.parse(parsed);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new InternalServerError(`Response validation failed: ${error.message}`);
      }
      throw new InternalServerError('Unexpected error during response validation');
    }
  }

  private _buildPayload<T extends z.ZodTypeAny>(options: GenerateOptions<T>): object {
    const model = options.model || DEFAULT_MODEL;
    const jsonSchema = zodToJsonSchema(options.schema, { name: 'structured_response' });

    return {
      model,
      messages: [
        { role: 'system', content: options.systemMessage },
        { role: 'user', content: options.userMessage },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'structured_response',
          strict: true,
          schema: jsonSchema,
        },
      },
      ...(options.params || {}),
    };
  }

  private _fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }
}
