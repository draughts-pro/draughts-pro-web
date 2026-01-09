import { atom } from "jotai";
import type { GameRoom, PieceColor } from "./multiplayer";

export interface MultiplayerGameState {
  isMultiplayer: boolean;
  room: GameRoom | null;
  playerId: string | null;
  playerColor: PieceColor | null;
  opponentName: string | null;
}

export const multiplayerGameStateAtom = atom<MultiplayerGameState>({
  isMultiplayer: false,
  room: null,
  playerId: null,
  playerColor: null,
  opponentName: null,
});

export const isMyTurnAtom = atom((get) => {
  const mpState = get(multiplayerGameStateAtom);
  if (!mpState.isMultiplayer || !mpState.room) return true;
  return mpState.room.currentTurn === mpState.playerColor;
});
