/** The staff code typed on this device (kept until "Verrouiller"). */
const KEY = 'chasse-tresor:staff-pin';
const listeners = new Set<() => void>();

export function getStaffPin(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
export function setStaffPin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(KEY, pin);
    else localStorage.removeItem(KEY);
  } catch { /* private mode */ }
  listeners.forEach((l) => l());
}
export function onStaffPinChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Thrown when the server refuses the staff code. */
export class StaffAuthError extends Error {
  constructor() { super('staff-unauthorized'); }
}
