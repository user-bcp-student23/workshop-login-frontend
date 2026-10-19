import '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { getHttpErrorMessage } from './http-error-message';

describe('getHttpErrorMessage', () => {
  it('prefers the requested backend field in an HTTP error', () => {
    const error = new HttpErrorResponse({
      error: { message: 'Invalid credentials', detail: 'Task service unavailable' },
      status: 401,
      statusText: 'Unauthorized'
    });

    expect(getHttpErrorMessage(error, 'message', 'Fallback')).toBe('Invalid credentials');
    expect(getHttpErrorMessage(error, 'detail', 'Fallback')).toBe('Task service unavailable');
  });

  it('falls back to the HTTP message, ordinary error message, then supplied fallback', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    expect(getHttpErrorMessage(httpError, 'detail', 'Fallback')).toBe(httpError.message);
    expect(getHttpErrorMessage(new Error('Request failed'), 'message', 'Fallback')).toBe('Request failed');
    expect(getHttpErrorMessage({}, 'message', 'Fallback')).toBe('Fallback');
  });

  it('ignores non-string and empty backend messages', () => {
    const error = new HttpErrorResponse({
      error: { detail: 42, message: '' },
      status: 400,
      statusText: 'Bad Request'
    });

    expect(getHttpErrorMessage(error, 'detail', 'Fallback')).toBe(error.message);
    expect(getHttpErrorMessage(error, 'message', 'Fallback')).toBe(error.message);
  });
});
