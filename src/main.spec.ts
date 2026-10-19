import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@angular/common/http', () => ({ provideHttpClient: vi.fn(() => 'http-provider') }));
vi.mock('@angular/platform-browser', () => ({ bootstrapApplication: vi.fn() }));
vi.mock('@angular/router', () => ({ provideRouter: vi.fn(() => 'router-provider') }));
vi.mock('./app/app.component', () => ({ AppComponent: class AppComponent {} }));
vi.mock('./app/app.routes', () => ({ routes: ['test-route'] }));

describe('application bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(bootstrapApplication).mockReset();
    vi.mocked(provideHttpClient).mockClear();
    vi.mocked(provideRouter).mockClear();
  });

  it('registers the router and Angular HTTP providers', async () => {
    vi.mocked(bootstrapApplication).mockResolvedValue(undefined as never);

    await import('./main');

    expect(provideHttpClient).toHaveBeenCalledOnce();
    expect(provideRouter).toHaveBeenCalledWith(['test-route']);
    expect(bootstrapApplication).toHaveBeenCalledWith(
      expect.any(Function),
      { providers: ['http-provider', 'router-provider'] }
    );
  });

  it('reports a bootstrap failure', async () => {
    const error = new Error('Bootstrap failed');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(bootstrapApplication).mockRejectedValue(error);

    await import('./main');
    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(error);
  });
});
