import { HttpErrorResponse } from '@angular/common/http';

type ErrorResponseField = 'message' | 'detail';

export function getHttpErrorMessage(
  error: unknown,
  responseField: ErrorResponseField,
  fallback: string
): string {
  if (error instanceof HttpErrorResponse) {
    const responseMessage = getResponseMessage(error.error, responseField);
    return responseMessage || error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getResponseMessage(response: unknown, field: ErrorResponseField): string | undefined {
  if (typeof response !== 'object' || response === null || !(field in response)) {
    return undefined;
  }

  const message = response[field];
  return typeof message === 'string' && message ? message : undefined;
}
