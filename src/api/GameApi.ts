import type { CheckinResult, CheckinSource, GameState, Target } from '../types';

/**
 * Everything the screens need from the data layer.
 * Two implementations:
 *  - localApi: no server, data kept in this browser (for building and testing the UI now)
 *  - httpApi:  talks to the Next.js backend (see API.md), shared between all phones
 */
export interface GameApi {
  readonly mode: 'local' | 'http';
  getState(): Promise<GameState>;
  /** Calls `onChange` whenever the state changes (`onError` if the server can't be reached). Returns a function to stop listening. */
  subscribe(onChange: (state: GameState) => void, onError?: () => void): () => void;
  /** Checks a staff code with the server. */
  verifyStaff(pin: string): Promise<boolean>;
  /** Teams pass the `token` read from the checkpoint's QR. Staff check-ins need no token. */
  checkin(teamId: number, target: Target, source: CheckinSource, token?: string, pin?: string): Promise<CheckinResult>;
  /** Checks a team's PIN when a phone picks its team. */
  verifyTeam(teamId: number, pin: string): Promise<boolean>;
  /** Staff: current code to show in a checkpoint's QR (it changes every minute). */
  getQrToken(cp: number): Promise<{ token: string; expiresInMs: number }>;
  startGame(): Promise<GameState>;
  undoLast(teamId: number): Promise<GameState>;
  reset(): Promise<GameState>;
}

export const EMPTY_STATE: GameState = { startedAt: null, checkins: [] };
