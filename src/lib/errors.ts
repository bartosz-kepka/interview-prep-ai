/**
 * Custom error classes for consistent error handling across the application.
 */

/**
 * Error thrown when an external service (e.g., AI API) fails, resulting in a 502 Bad Gateway response.
 */
export class BadGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadGatewayError";
  }
}

/**
 * Error thrown for internal server errors, resulting in a 500 Internal Server Error response.
 */
export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}

/**
 * Error thrown when a requested resource is not found, resulting in a 404 Not Found response.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown when the request is syntactically correct but semantically invalid, resulting in a 422 Unprocessable Entity response.
 */
export class UnprocessableEntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnprocessableEntityError";
  }
}
