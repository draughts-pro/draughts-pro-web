import { soundManager } from "@/pages/game/utils/sounds";
import { atom } from "jotai";
import { preferencesAtom } from "../../settings/utils/preferences";
import { variants } from "../../settings/utils/variants";
import { calculateAIMove } from "./ai";
import {
  cloneBoard,
  createInitialBoard,
  getPieceAt,
  setPieceAt,
} from "./board";
import { multiplayerService } from "./multiplayer";
import { multiplayerGameStateAtom } from "./multiplayer-state";
import { checkGameOver, getValidMoves, hasAnyCaptures } from "./rules";
import type { Position } from "./state";
import {
  boardAtom,
  capturedPiecesAtom,
  currentTurnAtom,
  gameEndReasonAtom,
  gameModeAtom,
  gameStatusAtom,
  hintMoveAtom,
  isAiThinkingAtom,
  lastMoveAtom,
  selectedPieceAtom,
  validMovesAtom,
  winnerAtom
} from "./state";

export const selectPieceActionAtom = atom(null, (get, set, pos: Position) => {
  const board = get(boardAtom);
  const currentTurn = get(currentTurnAtom);
  const gameStatus = get(gameStatusAtom);
  const prefs = get(preferencesAtom);
  const variant = variants[prefs.variant];

  if (gameStatus !== "playing") {
    return;
  }

  const multiplayerState = get(multiplayerGameStateAtom);
  if (
    multiplayerState.isMultiplayer &&
    multiplayerState.playerColor !== currentTurn
  ) {
    return;
  }

  const piece = getPieceAt(board, pos);
  if (!piece || piece.color !== currentTurn) {
    set(selectedPieceAtom, null);
    set(validMovesAtom, []);
    return;
  }

  const mustCapture =
    variant.forcedCapture && hasAnyCaptures(board, currentTurn, variant);

  const moves = getValidMoves(board, pos, mustCapture, variant);

  if (moves.length === 0) {
    set(selectedPieceAtom, null);
    set(validMovesAtom, []);
    return;
  }

  soundManager.setSoundEnabled(prefs.sound);
  soundManager.playSelect();

  set(selectedPieceAtom, pos);
  set(
    validMovesAtom,
    moves.map((m) => m.to)
  );
});

export const movePieceActionAtom = atom(null, (get, set, to: Position) => {
  const board = get(boardAtom);
  const selectedPiece = get(selectedPieceAtom);
  const currentTurn = get(currentTurnAtom);
  const prefs = get(preferencesAtom);
  const variant = variants[prefs.variant];
  const capturedPieces = get(capturedPiecesAtom);

  if (!selectedPiece) return;

  const from = selectedPiece;
  const piece = getPieceAt(board, from);
  if (!piece) return;

  const mustCapture =
    variant.forcedCapture && hasAnyCaptures(board, currentTurn, variant);
  const validMoves = getValidMoves(board, from, mustCapture, variant);
  const moveData = validMoves.find(
    (m) => m.to.row === to.row && m.to.col === to.col
  );

  if (!moveData) return;

  let newBoard = cloneBoard(board);

  if (variant.capturedPiecesRemovedWhen === "immediately") {
    moveData.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  newBoard = setPieceAt(newBoard, from, null);

  let movedPiece = { ...piece };
  const shouldPromote =
    !piece.isKing &&
    ((piece.color === "dark" && to.row === newBoard.length - 1) ||
      (piece.color === "light" && to.row === 0));

  if (shouldPromote) {
    movedPiece.isKing = true;
  }

  newBoard = setPieceAt(newBoard, to, movedPiece);

  if (variant.capturedPiecesRemovedWhen === "afterSequence") {
    moveData.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  const newCapturedPieces = { ...capturedPieces };
  if (piece.color === "dark") {
    newCapturedPieces.light += moveData.capturedPieces.length;
  } else {
    newCapturedPieces.dark += moveData.capturedPieces.length;
  }

  const nextTurn = currentTurn === "dark" ? "light" : "dark";

  soundManager.setSoundEnabled(prefs.sound);
  if (shouldPromote) {
    soundManager.playPromotion();
  } else if (moveData.capturedPieces.length > 0) {
    soundManager.playCapture();
  } else {
    soundManager.playMove();
  }

  set(boardAtom, newBoard);
  set(currentTurnAtom, nextTurn);
  set(selectedPieceAtom, null);
  set(validMovesAtom, []);
  set(capturedPiecesAtom, newCapturedPieces);
  set(lastMoveAtom, { from, to });

  const gameOver = checkGameOver(newBoard, nextTurn, variant);
  if (gameOver.isOver) {
    set(gameStatusAtom, gameOver.winner === "light" ? "won" : "lost");
    set(winnerAtom, gameOver.winner);
    set(gameEndReasonAtom, gameOver.reason);

    if (gameOver.winner === "light") {
      soundManager.playWin();
    } else {
      soundManager.playLose();
    }

    const multiplayerState = get(multiplayerGameStateAtom);
    if (multiplayerState.isMultiplayer && multiplayerState.room && multiplayerState.playerId) {
      multiplayerService.endGame(
        multiplayerState.room.id,
        gameOver.winner || null,
        gameOver.reason || "unknown"
      );
    }
  }

  const multiplayerState = get(multiplayerGameStateAtom);
  if (multiplayerState.isMultiplayer && multiplayerState.room && multiplayerState.playerId) {
    multiplayerService.makeMove(
      multiplayerState.room.id,
      multiplayerState.playerId,
      { from, to, captures: moveData.capturedPieces },
      newBoard,
      nextTurn
    );
  }
});

export const forfeitActionAtom = atom(null, (get, set) => {
  const prefs = get(preferencesAtom);
  const multiplayerState = get(multiplayerGameStateAtom);

  if (multiplayerState.isMultiplayer && multiplayerState.room && multiplayerState.playerId) {
      const opponentColor = multiplayerState.playerColor === "light" ? "dark" : "light";
      multiplayerService.endGame(
          multiplayerState.room.id,
          opponentColor,
          "forfeit"
      );
      return;
  }

  set(selectedPieceAtom, null);
  set(validMovesAtom, []);
  set(hintMoveAtom, null);
  set(gameStatusAtom, "lost");
  set(winnerAtom, "dark");
  set(gameEndReasonAtom, "forfeit");

  soundManager.setSoundEnabled(prefs.sound);
  soundManager.playLose();
});

export const getHintActionAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  const currentTurn = get(currentTurnAtom);
  const gameStatus = get(gameStatusAtom);
  const gameMode = get(gameModeAtom);
  const prefs = get(preferencesAtom);
  const variant = variants[prefs.variant];

  if (gameStatus !== "playing") return;
  if (gameMode === "ai" && currentTurn === "dark") return;

  const hintMove = calculateAIMove(
    board,
    currentTurn,
    prefs.difficulty,
    variant
  );

  if (hintMove) {
    set(hintMoveAtom, { from: hintMove.from, to: hintMove.to });

    setTimeout(() => {
      set(hintMoveAtom, null);
    }, 3000);
  }
});

export const newGameActionAtom = atom(null, (get, set) => {
  const prefs = get(preferencesAtom);
  const variant = variants[prefs.variant];
  const newBoard = createInitialBoard(variant);

  set(boardAtom, newBoard);
  set(currentTurnAtom, "light");
  set(selectedPieceAtom, null);
  set(validMovesAtom, []);
  set(capturedPiecesAtom, { dark: 0, light: 0 });
  set(isAiThinkingAtom, false);
  set(gameStatusAtom, "playing");
  set(winnerAtom, null);
  set(lastMoveAtom, null);
  set(hintMoveAtom, null);
  set(gameEndReasonAtom, null);
});

export const executeAIMoveActionAtom = atom(null, async (get, set) => {
  const board = get(boardAtom);
  const currentTurn = get(currentTurnAtom);
  const gameMode = get(gameModeAtom);
  const gameStatus = get(gameStatusAtom);
  const prefs = get(preferencesAtom);
  const variant = variants[prefs.variant];

  if (gameMode !== "ai" || currentTurn !== "dark" || gameStatus !== "playing")
    return;

  set(isAiThinkingAtom, true);

  await new Promise((resolve) => setTimeout(resolve, 500));

  const aiMove = calculateAIMove(board, "dark", prefs.difficulty, variant);

  if (!aiMove) {
    set(isAiThinkingAtom, false);
    return;
  }

  let newBoard = cloneBoard(board);
  const piece = getPieceAt(newBoard, aiMove.from);
  if (!piece) {
    set(isAiThinkingAtom, false);
    return;
  }

  if (variant.capturedPiecesRemovedWhen === "immediately") {
    aiMove.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  newBoard = setPieceAt(newBoard, aiMove.from, null);

  let movedPiece = { ...piece };
  const shouldPromote =
    !piece.isKing &&
    ((piece.color === "dark" && aiMove.to.row === newBoard.length - 1) ||
      (piece.color === "light" && aiMove.to.row === 0));

  if (shouldPromote) {
    movedPiece.isKing = true;
  }

  newBoard = setPieceAt(newBoard, aiMove.to, movedPiece);

  if (variant.capturedPiecesRemovedWhen === "afterSequence") {
    aiMove.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  const capturedPieces = get(capturedPiecesAtom);
  const newCapturedPieces = { ...capturedPieces };
  newCapturedPieces.light += aiMove.capturedPieces.length;

  soundManager.setSoundEnabled(prefs.sound);
  if (shouldPromote) {
    soundManager.playPromotion();
  } else if (aiMove.capturedPieces.length > 0) {
    soundManager.playCapture();
  } else {
    soundManager.playMove();
  }

  set(boardAtom, newBoard);
  set(currentTurnAtom, "light");
  set(capturedPiecesAtom, newCapturedPieces);
  set(isAiThinkingAtom, false);
  set(lastMoveAtom, { from: aiMove.from, to: aiMove.to });

  const gameOver = checkGameOver(newBoard, "light", variant);
  if (gameOver.isOver) {
    set(gameStatusAtom, gameOver.winner === "light" ? "won" : "lost");
    set(winnerAtom, gameOver.winner);
    set(gameEndReasonAtom, gameOver.reason);

    if (gameOver.winner === "light") {
      soundManager.playWin();
    } else {
      soundManager.playLose();
    }
  }
});

export const applyOpponentMoveActionAtom = atom(
  null,
  (
    get,
    set,
    moveData: {
      from: Position;
      to: Position;
      board: any;
      currentTurn: "light" | "dark";
      captures?: Position[];
    }
  ) => {
    const prefs = get(preferencesAtom);
    const currentCaptured = get(capturedPiecesAtom);

    // Update captured pieces count
    if (moveData.captures && moveData.captures.length > 0) {
      const newCaptured = { ...currentCaptured };
      if (moveData.currentTurn === "light") {
         newCaptured.light += moveData.captures.length;
      } else {
         newCaptured.dark += moveData.captures.length;
      }
      set(capturedPiecesAtom, newCaptured);
    }

    set(boardAtom, moveData.board);
    set(currentTurnAtom, moveData.currentTurn);
    set(lastMoveAtom, { from: moveData.from, to: moveData.to });
    set(selectedPieceAtom, null);
    set(validMovesAtom, []);

    soundManager.setSoundEnabled(prefs.sound);
    soundManager.playMove();

    if (moveData.captures && moveData.captures.length > 0) {
        soundManager.playCapture();
    } else {
        soundManager.playMove();
    }
  }
);
