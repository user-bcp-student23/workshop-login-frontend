import '@angular/compiler';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { LoginComponent } from './login.component';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, String(value)); }),
    removeItem: vi.fn((key: string) => { values.delete(key); })
  };
}

describe('H-03 preference merge characterization', () => {
  let storage: ReturnType<typeof memoryStorage>;
  let navigate: ReturnType<typeof vi.fn>;
  const defaults = { theme: 'light', showTips: true, compact: false };

  beforeEach(() => {
    storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('sessionStorage', memoryStorage());
    navigate = vi.fn().mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function createComponent(): LoginComponent {
    return new LoginComponent(
      { navigate } as unknown as Router,
      { login: vi.fn().mockResolvedValue({ token: 'test-token', user: { username: 'student' } }) } as unknown as AuthService,
      new SessionService(),
      { markForCheck: vi.fn() } as unknown as ChangeDetectorRef
    );
  }

  it.each([
    { name: 'absent', saved: undefined, expected: defaults },
    { name: 'empty object', saved: '{}', expected: defaults },
    { name: 'partial', saved: '{"theme":"dark"}', expected: { ...defaults, theme: 'dark' } },
    { name: 'false booleans', saved: '{"showTips":false,"compact":false}', expected: { ...defaults, showTips: false } },
    { name: 'compact enabled', saved: '{"compact":true}', expected: { ...defaults, compact: true } },
    {
      name: 'additional nested properties',
      saved: '{"view":{"columns":2,"pins":["tasks"]},"locale":"es"}',
      expected: { ...defaults, view: { columns: 2, pins: ['tasks'] }, locale: 'es' }
    },
    { name: 'legacy JSON null without enumerable properties', saved: 'null', expected: defaults }
  ])('loads and serializes $name without changing merge semantics', async ({ saved, expected }) => {
    if (saved !== undefined) storage.setItem('workshop_preferences', saved);
    const component = createComponent();
    expect(component.preferences).toEqual(expected);
    component.username = 'student';
    component.password = 'password';
    await component.login();
    expect(JSON.parse(storage.getItem('workshop_preferences') || '{}')).toEqual(expected);
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('reports invalid JSON and retains defaults', () => {
    storage.setItem('workshop_preferences', '{');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(createComponent().preferences).toEqual(defaults);
    expect(log).toHaveBeenCalledWith('Preferences could not be loaded', expect.any(SyntaxError));
  });

  it('reports unavailable preference storage and retains defaults', () => {
    const error = new Error('Preferences unavailable');
    storage.getItem.mockImplementation(() => { throw error; });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(createComponent().preferences).toEqual(defaults);
    expect(log).toHaveBeenCalledWith('Preferences could not be loaded', error);
  });

  it('does not leak a previous instance nested preferences into a new login', () => {
    storage.setItem('workshop_preferences', '{"view":{"columns":2}}');
    const first = createComponent();
    storage.removeItem('workshop_preferences');
    expect(createComponent().preferences).toEqual(defaults);
    expect(first.preferences).toEqual({ ...defaults, view: { columns: 2 } });
  });
});
