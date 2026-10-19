import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('posts the documented login payload with the existing timeout', async () => {
    const response = { token: 'test-token', user: { username: 'student' } };
    const post = vi.fn().mockReturnValue(of(response));
    const service = new AuthService({ post } as unknown as HttpClient);

    await expect(service.login({
      username: 'student',
      password: 'Workshop123!',
      client: 'angular-workshop'
    })).resolves.toEqual(response);

    expect(post).toHaveBeenCalledWith(
      'http://localhost:8080/auth/login',
      { username: 'student', password: 'Workshop123!', client: 'angular-workshop' },
      { timeout: 5000 }
    );
  });
});
