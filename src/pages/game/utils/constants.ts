export const AI_SETTINGS = {
  DEPTH: {
    EASY: 1,
    MEDIUM: 3,
    HARD: 5,
  },
  TOP_MOVES_COUNT: 3,
} as const;

export const PIECE_VALUES = {
  REGULAR: 1,
  KING: 3,
} as const;

export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_CAPTURED_DISPLAY: 12,
} as const;
