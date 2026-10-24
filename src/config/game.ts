import type { Checkpoint, CpId, Team } from '../types';

/** Size of the treasure map drawing, in map units (SVG viewBox). */
export const MAP = { width: 1000, height: 620 } as const;

export const TOTAL_CPS = 5;
/** Step number of the arrival in the Salle du Trésor. */
export const SALLE_STEP = TOTAL_CPS + 1;
/** Number of teams that reach the final mini-game. */
export const FINALISTS = 2;

/** How often the app refreshes the data when connected to the backend. */
export const POLL_MS = 3000;

/**
 * Checkpoint positions on the map. Move x / y to match the real school layout.
 * (0,0) is the top-left corner of the map, (1000, 620) the bottom-right.
 */
export const CHECKPOINTS: Checkpoint[] = [
  { id: 1, label: 'CP1', x: 215, y: 175 },
  { id: 2, label: 'CP2', x: 520, y: 118 },
  { id: 3, label: 'CP3', x: 812, y: 214 },
  { id: 4, label: 'CP4', x: 735, y: 455 },
  { id: 5, label: 'CP5', x: 318, y: 452 },
];

/** Harbour where ships wait before their first checkpoint. */
export const DEPART = { x: 108, y: 548 };
/** Hidden-treasure box. It never shows the real place of the Salle. */
export const TREASURE = { x: 520, y: 300 };

const loop = (start: CpId): CpId[] =>
  [0, 1, 2, 3, 4].map((k) => (((start - 1 + k) % TOTAL_CPS) + 1) as CpId);

const team = (
  id: number, colorName: string, color: string, onColor: string, startCp: CpId, offsetMin = 0,
): Team => ({
  id, name: `Équipe ${id}`, colorName, color, onColor, startCp, offsetMin, route: loop(startCp),
});

export const TEAMS: Team[] = [
  team(1, 'Rouge', '#BE2323', '#FFFFFF', 1),
  team(2, 'Bleu', '#1E5AB4', '#FFFFFF', 2),
  team(3, 'Vert', '#238C3C', '#FFFFFF', 3),
  team(4, 'Jaune', '#E0A800', '#341E0E', 4),
  team(5, 'Orange', '#E16E14', '#FFFFFF', 5),
  team(6, 'Violet', '#7832A0', '#FFFFFF', 1, 10),
  team(7, 'Rose', '#D7468C', '#FFFFFF', 2, 10),
  team(8, 'Turquoise', '#009696', '#FFFFFF', 3, 10),
];

export const teamById = (id: number): Team | undefined => TEAMS.find((t) => t.id === id);
export const checkpointById = (id: CpId): Checkpoint => CHECKPOINTS.find((c) => c.id === id)!;

/** Browser storage keys. */
export const STORAGE = {
  localGame: 'chasse-tresor:game:v1',
  myTeam: 'chasse-tresor:my-team',
} as const;
