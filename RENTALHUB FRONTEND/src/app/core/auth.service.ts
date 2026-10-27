import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API, Role } from './api';

const KEY = 'rh.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private state = signal<{ token: string; role: Role; email: string } | null>(this.load());

  readonly loggedIn = computed(() => !!this.state());
  readonly role = computed(() => this.state()?.role ?? null);
  readonly email = computed(() => this.state()?.email ?? '');
  readonly token = computed(() => this.state()?.token ?? null);

  login(email: string, password: string) {
    return this.http.post<{ token: string; role: Role }>(`${API}/api/auth/login`, { email, password })
      .pipe(tap(r => this.save(r.token, r.role)));
  }

  register(fullName: string, email: string, password: string, role: Role) {
    return this.http.post<any>(`${API}/api/auth/register`, { fullName, email, password, role });
  }

  logout() {
    this.state.set(null);
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  }

  private save(token: string, role: Role) {
    const s = { token, role, email: this.emailFrom(token) };
    this.state.set(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
  }

  private load() {
    try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch { return null; }
  }

  private emailFrom(token: string): string {
    try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub ?? ''; }
    catch { return ''; }
  }
}
