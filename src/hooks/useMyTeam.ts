import { useState } from 'react';
import { STORAGE, teamById } from '../config/game';
import type { Team } from '../types';

interface Saved { id: number; pin: string }

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE.myTeam);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<Saved>;
    return typeof v === 'object' && v && teamById(Number(v.id)) && typeof v.pin === 'string' ? { id: Number(v.id), pin: v.pin } : null;
  } catch {
    return null; // old format (team number only) → ask again, with the PIN
  }
}

/** The team (and its PIN) chosen on this phone, remembered between scans. */
export function useMyTeam() {
  const [saved, setSaved] = useState<Saved | null>(load);
  const choose = (id: number, pin: string) => {
    try { localStorage.setItem(STORAGE.myTeam, JSON.stringify({ id, pin })); } catch { /* private mode */ }
    setSaved({ id, pin });
  };
  const forget = () => {
    try { localStorage.removeItem(STORAGE.myTeam); } catch { /* private mode */ }
    setSaved(null);
  };
  const team: Team | null = saved ? teamById(saved.id) ?? null : null;
  return { team, pin: saved?.pin ?? null, choose, forget };
}
