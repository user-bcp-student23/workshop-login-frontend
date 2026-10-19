import { Injectable } from '@angular/core';
import { AuthUser } from '../models/auth.models';

const TOKEN_KEY = 'workshop_token';
const USER_KEY = 'workshop_user';

interface StoredSession {
  token: string;
  user: Partial<AuthUser>;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  initialize(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  save(token: string, user: AuthUser): void {
    this.initialize();
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  read(): StoredSession | null {
    this.initialize();
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const user: unknown = JSON.parse(sessionStorage.getItem(USER_KEY) || '{}');
    if (!this.isStoredUser(user)) {
      throw new Error('Los datos de sesion guardados no son validos. Cierre la sesion e ingrese nuevamente.');
    }
    return { token, user };
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.initialize();
  }

  private isStoredUser(user: unknown): user is Partial<AuthUser> {
    return typeof user === 'object' && user !== null && !Array.isArray(user)
      && (!('username' in user) || typeof user.username === 'string')
      && (!('displayName' in user) || typeof user.displayName === 'string');
  }
}
