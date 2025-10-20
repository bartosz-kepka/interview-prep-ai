/**
 * Custom error classes for consistent error handling across the application.
 */

/**
 * Error thrown when an external service (e.g., AI API) fails, resulting in a 502 Bad Gateway response.
 */
export class BadGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadGatewayError';
  }
}

/**
 * Error thrown for internal server errors, resulting in a 500 Internal Server Error response.
 */
export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}
