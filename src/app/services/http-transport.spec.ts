import '@angular/compiler';
import { HttpClient, HttpErrorResponse, HttpXhrBackend } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { TasksService } from './tasks.service';

class TestXhr extends EventTarget {
  readonly headers = new Map<string, string>();
  readonly upload = new EventTarget();
  timeout = 0;
  readyState = 1;
  status = 0;
  statusText = '';
  responseText = '';
  responseType = '';
  withCredentials = false;
  method = '';
  url = '';
  body: unknown;
  private timer?: ReturnType<typeof setTimeout>;

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(name: string, value: string): void {
    this.headers.set(name, value);
  }

  getAllResponseHeaders(): string {
    return 'Content-Type: application/json';
  }

  send(body: unknown): void {
    this.body = body;
    if (this.timeout) {
      this.timer = setTimeout(() => this.dispatchEvent(new Event('timeout')), this.timeout);
    }
  }

  abort(): void {
    clearTimeout(this.timer);
  }

  respond(status: number, text: string): void {
    clearTimeout(this.timer);
    this.status = status;
    this.responseText = text;
    this.readyState = 4;
    this.dispatchEvent(new Event('load'));
  }
}

describe('Angular HTTP transport with a simulated XMLHttpRequest', () => {
  let xhr: TestXhr;
  let http: HttpClient;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('XMLHttpRequest', { DONE: 4 });
    xhr = new TestXhr();
    const injector = Injector.create({ providers: [] });
    const backend = runInInjectionContext(injector, () => new HttpXhrBackend({
      build: () => xhr as unknown as XMLHttpRequest
    }));
    http = new HttpClient(backend);
  });

  afterEach(() => {
    xhr.abort();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('sets JSON headers, serializes the body and rejects login after 5000 ms', async () => {
    const result = new AuthService(http).login({
      username: 'student', password: 'Workshop123!', client: 'angular-workshop'
    }).catch((error: unknown) => error);
    expect(xhr.headers.get('Accept')).toBe('application/json, text/plain, */*');
    expect(xhr.headers.get('Content-Type')).toBe('application/json');
    expect(xhr.headers.has('Authorization')).toBe(false);
    expect(xhr.body).toBe('{"username":"student","password":"Workshop123!","client":"angular-workshop"}');
    expect(xhr.timeout).toBe(5000);
    let settled = false;
    void result.then(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(4999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const error = await result;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    if (!(error instanceof HttpErrorResponse)) throw new Error('Expected HTTP timeout');
    expect(error.status).toBe(0);
    expect(error.error).toBeInstanceOf(DOMException);
    expect(error.error.name).toBe('TimeoutError');
  });

  it('turns invalid JSON in a 200 response into an HTTP parse error', async () => {
    const result = new TasksService(http).getTasks('student', 'test-token')
      .catch((error: unknown) => error);
    expect(xhr.timeout).toBe(0);
    expect(xhr.headers.has('Content-Type')).toBe(false);
    expect(xhr.headers.get('Authorization')).toBe('Bearer test-token');
    xhr.respond(200, '{');
    const error = await result;
    expect(error).toBeInstanceOf(HttpErrorResponse);
    if (!(error instanceof HttpErrorResponse)) throw new Error('Expected HTTP parse error');
    expect(error.status).toBe(200);
    expect(error.ok).toBe(false);
  });

  it('decodes task JSON as a direct array without a wrapper', async () => {
    const result = new TasksService(http).getTasks('student', 'test-token');
    xhr.respond(200, '[{"title":"Requirement","status":"TODO","priority":"HIGH","owner":"student","description":""}]');
    await expect(result).resolves.toEqual([{
      title: 'Requirement', status: 'TODO', priority: 'HIGH', owner: 'student', description: ''
    }]);
  });
});
