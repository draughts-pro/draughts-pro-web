import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { preferencesAtom } from "../../settings/utils/preferences";
import { variants } from "../../settings/utils/variants";
import { createInitialBoard } from "./board";

export type PieceColor = "dark" | "light";

export interface Piece {
  color: PieceColor;
  isKing: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type BoardState = (Piece | null)[][];

const _boardStateAtom = atom<BoardState | null>(null);

export const boardAtom = atom(
  (get) => {
    const storedBoard = get(_boardStateAtom);
    if (storedBoard !== null) return storedBoard;

    const prefs = get(preferencesAtom);
    const variant = variants[prefs.variant];
    return createInitialBoard(variant);
  },
  (_get, set, newBoard: BoardState) => {
    set(_boardStateAtom, newBoard);
  }
);

export const currentTurnAtom = atomWithStorage<PieceColor>(
  "game.currentTurn",
  "light"
);
export const selectedPieceAtom = atom<Position | null>(null);
export const validMovesAtom = atom<Position[]>([]);
export const lastMoveAtom = atom<{ from: Position; to: Position } | null>(null);
export const hintMoveAtom = atom<{ from: Position; to: Position } | null>(null);
export const capturedPiecesAtom = atom<{ dark: number; light: number }>({
  dark: 0,
  light: 0,
});

export type GameMode = "ai" | "local";
export const gameModeAtom = atomWithStorage<GameMode>("game.mode", "ai");
export const isAiThinkingAtom = atom<boolean>(false);

export type GameStatus = "playing" | "won" | "lost" | "draw";
export const gameStatusAtom = atom<GameStatus>("playing");
export const winnerAtom = atom<PieceColor | null>(null);

export type GameEndReason = "capture" | "noMoves" | "forfeit" | null;
export const gameEndReasonAtom = atom<GameEndReason>(null);
