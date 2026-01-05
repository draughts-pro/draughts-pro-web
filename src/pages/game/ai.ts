import type { Variant } from "../settings/variants";
import { cloneBoard, getPieceAt, setPieceAt } from "./board";
import { getValidMoves, hasAnyCaptures } from "./rules";
import type { BoardState, PieceColor, Position } from "./state";

interface MoveWithCaptures {
  from: Position;
  to: Position;
  capturedPieces: Position[];
}

interface EvaluatedMove extends MoveWithCaptures {
  score: number;
}

function getAllValidMoves(
  board: BoardState,
  color: PieceColor,
  variant: Variant
): MoveWithCaptures[] {
  const allMoves: MoveWithCaptures[] = [];
  const mustCapture = variant.forcedCapture && hasAnyCaptures(board, color, variant);

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const moves = getValidMoves(board, from, mustCapture, variant);
        allMoves.push(...moves.map(m => ({ from, ...m })));
      }
    }
  }

  return allMoves;
}

function evaluateBoard(
  board: BoardState,
  color: PieceColor
): number {
  let score = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pieceValue = piece.isKing ? 3 : 1;
      const positionBonus = piece.isKing ? 0 : row / board.length;

      if (piece.color === color) {
        score += pieceValue + positionBonus;
      } else {
        score -= pieceValue + positionBonus;
      }
    }
  }

  return score;
}

function applyMove(
  board: BoardState,
  move: MoveWithCaptures,
  variant: Variant
): BoardState {
  let newBoard = cloneBoard(board);
  const piece = getPieceAt(newBoard, move.from);
  if (!piece) return newBoard;

  if (variant.capturedPiecesRemovedWhen === "immediately") {
    move.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  newBoard = setPieceAt(newBoard, move.from, null);

  let movedPiece = { ...piece };
  const shouldPromote =
    !piece.isKing &&
    ((piece.color === "dark" && move.to.row === newBoard.length - 1) ||
      (piece.color === "light" && move.to.row === 0));

  if (shouldPromote) {
    movedPiece.isKing = true;
  }

  newBoard = setPieceAt(newBoard, move.to, movedPiece);

  if (variant.capturedPiecesRemovedWhen === "afterSequence") {
    move.capturedPieces.forEach((capturedPos) => {
      newBoard = setPieceAt(newBoard, capturedPos, null);
    });
  }

  return newBoard;
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiColor: PieceColor,
  variant: Variant
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }

  const currentColor = maximizingPlayer ? aiColor : aiColor === "dark" ? "light" : "dark";
  const allMoves = getAllValidMoves(board, currentColor, variant);

  if (allMoves.length === 0) {
    return maximizingPlayer ? -Infinity : Infinity;
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, aiColor, variant);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, aiColor, variant);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function calculateAIMove(
  board: BoardState,
  aiColor: PieceColor,
  difficulty: 1 | 2 | 3,
  variant: Variant
): MoveWithCaptures | null {
  const allMoves = getAllValidMoves(board, aiColor, variant);

  if (allMoves.length === 0) return null;

  if (difficulty === 1) {
    const captureMoves = allMoves.filter((m) => m.capturedPieces.length > 0);
    const movesToConsider = captureMoves.length > 0 ? captureMoves : allMoves;
    return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
  }

  const depth = difficulty === 2 ? 3 : 5;

  const evaluatedMoves: EvaluatedMove[] = allMoves.map((move) => {
    const newBoard = applyMove(board, move, variant);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, aiColor, variant);
    return { ...move, score };
  });

  evaluatedMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 2) {
    const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)];
  }

  return evaluatedMoves[0];
}
