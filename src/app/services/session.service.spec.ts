import '@angular/compiler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionService } from './session.service';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, String(value)); }),
    removeItem: vi.fn((key: string) => { values.delete(key); })
  };
}

describe('H-01 SessionService', () => {
  let persistent: ReturnType<typeof memoryStorage>;
  let temporary: ReturnType<typeof memoryStorage>;
  let service: SessionService;
  const user = { username: 'student', displayName: 'Student' };

  beforeEach(() => {
    persistent = memoryStorage();
    temporary = memoryStorage();
    vi.stubGlobal('localStorage', persistent);
    vi.stubGlobal('sessionStorage', temporary);
    persistent.setItem('workshop_preferences', '{"theme":"dark"}');
    service = new SessionService();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('stores only token/user in sessionStorage and survives a new service instance', () => {
    service.save('test-token', user);
    expect(new SessionService().read()).toEqual({ token: 'test-token', user });
    expect(persistent.getItem('workshop_token')).toBeNull();
    expect(persistent.getItem('workshop_user')).toBeNull();
    expect(temporary.getItem('workshop_user')).toBe(JSON.stringify(user));
    expect(persistent.getItem('workshop_preferences')).toBe('{"theme":"dark"}');
  });

  it('removes legacy credentials on initialization without migrating them', () => {
    persistent.setItem('workshop_token', 'legacy-token');
    persistent.setItem('workshop_user', JSON.stringify(user));
    service.initialize();
    expect(service.read()).toBeNull();
    expect(persistent.getItem('workshop_token')).toBeNull();
    expect(persistent.getItem('workshop_user')).toBeNull();
    expect(persistent.getItem('workshop_preferences')).toBe('{"theme":"dark"}');
  });

  it('clears both locations on logout without changing preferences', () => {
    service.save('test-token', user);
    persistent.setItem('workshop_token', 'legacy-token');
    persistent.setItem('workshop_user', JSON.stringify(user));
    service.clear();
    expect(service.read()).toBeNull();
    expect(persistent.getItem('workshop_token')).toBeNull();
    expect(persistent.getItem('workshop_user')).toBeNull();
    expect(temporary.getItem('workshop_user')).toBeNull();
    expect(persistent.getItem('workshop_preferences')).toBe('{"theme":"dark"}');
  });

  it('keeps the existing empty-owner behavior when no user was stored', () => {
    temporary.setItem('workshop_token', 'test-token');
    expect(service.read()).toEqual({ token: 'test-token', user: {} });
  });

  it.each(['{', 'null', '[]', '"student"', '{"username":42}', '{"displayName":42}'])(
    'rejects corrupt stored user %s instead of returning a success-shaped session', saved => {
      temporary.setItem('workshop_token', 'test-token');
      temporary.setItem('workshop_user', saved);
      expect(() => service.read()).toThrow();
    }
  );

  it('accepts the documented optional display name', () => {
    service.save('test-token', { username: 'student' });
    expect(service.read()).toEqual({ token: 'test-token', user: { username: 'student' } });
  });

  it('propagates storage read failures', () => {
    temporary.getItem.mockImplementation(() => { throw new Error('Read unavailable'); });
    expect(() => service.read()).toThrow('Read unavailable');
  });

  it.each(['workshop_token', 'workshop_user'])('propagates failed writes of %s', key => {
    temporary.setItem.mockImplementation(name => {
      if (name === key) throw new Error('Write unavailable');
    });
    expect(() => service.save('test-token', user)).toThrow('Write unavailable');
  });

  it('propagates legacy cleanup failures', () => {
    persistent.removeItem.mockImplementation(() => { throw new Error('Cleanup unavailable'); });
    expect(() => service.initialize()).toThrow('Cleanup unavailable');
    expect(() => service.read()).toThrow('Cleanup unavailable');
    expect(() => service.save('test-token', user)).toThrow('Cleanup unavailable');
  });

  it('propagates session removal failures', () => {
    temporary.removeItem.mockImplementation(() => { throw new Error('Removal unavailable'); });
    expect(() => service.clear()).toThrow('Removal unavailable');
  });
});
