/**
 * Backend mode: talks to the Next.js API described in API.md.
 * Live updates by asking the server for the state every POLL_MS (simple and reliable for 8 teams).
 */
import { POLL_MS } from '../config/game';
import type { CheckinResult, GameState } from '../types';
import type { GameApi } from './GameApi';
import { getStaffPin, StaffAuthError } from './staffPin';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];

/**
 * VITE_API_URL=http://localhost:3001 only works on the computer itself.
 * When a phone opens the site with the computer's network address (http://192.168.1.90:5173),
 * "localhost" would mean the phone: so we point to the same computer instead (http://192.168.1.90:3001).
 */
export function resolveApiBase(raw: string): string {
  const base = raw.trim().replace(/\/$/, '');
  try {
    const api = new URL(base);
    const page = window.location.hostname;
    if (LOCAL_HOSTS.includes(api.hostname) && !LOCAL_HOSTS.includes(page)) {
      api.hostname = page;
      return api.toString().replace(/\/$/, '');
    }
  } catch { /* keep as is */ }
  return base;
}

export function createHttpApi(rawBaseUrl: string): GameApi {
  const baseUrl = rawBaseUrl ? resolveApiBase(rawBaseUrl) : '';
  const url = (path: string) => `${baseUrl}${path}`;

  async function call<T>(path: string, init?: RequestInit & { staff?: boolean; pin?: string }): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const pin = init?.pin ?? (init?.staff ? getStaffPin() : null);
    if (pin) headers['X-Staff-Pin'] = pin;
    const res = await fetch(url(path), { ...init, cache: 'no-store', headers });
    if (res.status === 401) throw new StaffAuthError();
    if (!res.ok && res.status !== 409 && res.status !== 422) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  }

  const getState = () => call<GameState>('/api/state');

  return {
    mode: 'http',
    getState,
    subscribe(onChange, onError) {
      let stopped = false;
      const tick = async () => {
        try {
          const s = await getState();
          if (!stopped) onChange(s);
        } catch {
          if (!stopped) onError?.();
        }
      };
      const id = window.setInterval(tick, POLL_MS);
      const onFocus = () => void tick();
      window.addEventListener('focus', onFocus);
      return () => { stopped = true; window.clearInterval(id); window.removeEventListener('focus', onFocus); };
    },
    async checkin(teamId, target, source, token, pin) {
      try {
        return await call<CheckinResult>('/api/checkins', {
          method: 'POST',
          body: JSON.stringify({ teamId, target, source, token, pin }),
          staff: source === 'staff',
        });
      } catch (e) {
        return { ok: false, reason: e instanceof StaffAuthError ? 'unauthorized' : 'network' };
      }
    },
    startGame: () => call<GameState>('/api/game/start', { method: 'POST', staff: true }),
    undoLast: (teamId) => call<GameState>(`/api/checkins/last?teamId=${teamId}`, { method: 'DELETE', staff: true }),
    reset: () => call<GameState>('/api/reset', { method: 'POST', staff: true }),
    getQrToken: (cp) => call<{ token: string; expiresInMs: number }>(`/api/qr?cp=${cp}`, { staff: true }),
    async verifyTeam(teamId, pin) {
      const res = await fetch(url('/api/teams/verify'), {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, pin }),
      });
      if (res.status === 401) return false;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    },
    async verifyStaff(pin) {
      try {
        await call<{ ok: boolean }>('/api/staff/verify', { method: 'POST', pin });
        return true;
      } catch (e) {
        if (e instanceof StaffAuthError) return false;
        throw e;
      }
    },
  };
}
