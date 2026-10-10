import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

interface LoginResult { token: string; role: string; username: string; }

@Injectable({ providedIn: 'root' })
export class Auth {
  user = signal<{ username: string; role: string } | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null'),
  );

  constructor(private http: HttpClient) {}

  get token() { return localStorage.getItem('token') ?? ''; }
  get isAdmin() { return this.user()?.role === 'ADMIN'; }

  login(username: string, password: string) {
    return this.http
      .post<LoginResult>('http://localhost:3000/auth/login', { username, password })
      .pipe(
        tap((r) => {
          localStorage.setItem('token', r.token);
          localStorage.setItem('user', JSON.stringify({ username: r.username, role: r.role }));
          this.user.set({ username: r.username, role: r.role });
        }),
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
  }
}
