import type { Difficulty } from "../../settings/utils/preferences";
import type { Variant } from "../../settings/utils/variants";
import { cloneBoard, getPieceAt, setPieceAt } from "./board";
import { AI_SETTINGS, PIECE_VALUES } from "./constants";
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
  const mustCapture =
    variant.forcedCapture && hasAnyCaptures(board, color, variant);

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const moves = getValidMoves(board, from, mustCapture, variant);
        allMoves.push(...moves.map((m) => ({ from, ...m })));
      }
    }
  }

  return allMoves;
}

function evaluateBoard(
  board: BoardState,
  color: PieceColor,
  variant: Variant,
  useAdvancedEval: boolean = false
): number {
  let score = 0;
  const boardSize = board.length;
  let myPieces = 0;
  let myKings = 0;
  let opponentPieces = 0;
  let opponentKings = 0;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const isMyPiece = piece.color === color;
      const pieceValue = piece.isKing
        ? PIECE_VALUES.KING
        : PIECE_VALUES.REGULAR;

      if (isMyPiece) {
        if (piece.isKing) myKings++;
        else myPieces++;
      } else {
        if (piece.isKing) opponentKings++;
        else opponentPieces++;
      }

      let positionBonus = 0;

      if (useAdvancedEval) {
        if (!piece.isKing) {
          const progressRow =
            piece.color === "dark"
              ? row / boardSize
              : (boardSize - 1 - row) / boardSize;
          positionBonus = progressRow * 0.5;
        }

        const centerCol = boardSize / 2;
        const centerBonus = 1 - Math.abs(col - centerCol) / centerCol;
        positionBonus += centerBonus * 0.3;

        const edgeRow = row === 0 || row === boardSize - 1;
        const edgeCol = col === 0 || col === board[row].length - 1;
        if (piece.isKing && (edgeRow || edgeCol)) {
          positionBonus += 0.2;
        }
      } else {
        positionBonus = piece.isKing ? 0 : row / boardSize;
      }

      const totalValue = pieceValue + positionBonus;

      if (isMyPiece) {
        score += totalValue;
      } else {
        score -= totalValue;
      }
    }
  }

  if (useAdvancedEval) {
    const totalPieces = myPieces + myKings + opponentPieces + opponentKings;
    if (totalPieces < variant.piecesPerPlayer) {
      const kingAdvantage = (myKings - opponentKings) * 0.5;
      score += kingAdvantage;
    }

    if (opponentPieces + opponentKings === 0) {
      score += 1000;
    }
    if (myPieces + myKings === 0) {
      score -= 1000;
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
  variant: Variant,
  useAdvancedEval: boolean = false
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiColor, variant, useAdvancedEval);
  }

  const currentColor = maximizingPlayer
    ? aiColor
    : aiColor === "dark"
      ? "light"
      : "dark";
  const allMoves = getAllValidMoves(board, currentColor, variant);

  if (allMoves.length === 0) {
    return maximizingPlayer ? -Infinity : Infinity;
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        aiColor,
        variant,
        useAdvancedEval
      );
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        aiColor,
        variant,
        useAdvancedEval
      );
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function calculateEasyMove(allMoves: MoveWithCaptures[]): MoveWithCaptures {
  const captureMoves = allMoves.filter((m) => m.capturedPieces.length > 0);
  const movesToConsider = captureMoves.length > 0 ? captureMoves : allMoves;
  return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
}

function calculateMediumMove(
  allMoves: MoveWithCaptures[],
  board: BoardState,
  aiColor: PieceColor,
  variant: Variant
): MoveWithCaptures {
  const evaluatedMoves: EvaluatedMove[] = allMoves.map((move) => {
    const newBoard = applyMove(board, move, variant);
    const score = minimax(
      newBoard,
      AI_SETTINGS.DEPTH.MEDIUM - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      variant
    );
    return { ...move, score };
  });

  evaluatedMoves.sort((a, b) => b.score - a.score);

  const topMoves = evaluatedMoves.slice(
    0,
    Math.min(AI_SETTINGS.TOP_MOVES_COUNT, evaluatedMoves.length)
  );
  return topMoves[Math.floor(Math.random() * topMoves.length)];
}

function calculateHardMove(
  allMoves: MoveWithCaptures[],
  board: BoardState,
  aiColor: PieceColor,
  variant: Variant
): MoveWithCaptures {
  const evaluatedMoves: EvaluatedMove[] = allMoves.map((move) => {
    const newBoard = applyMove(board, move, variant);
    const score = minimax(
      newBoard,
      AI_SETTINGS.DEPTH.HARD - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      variant
    );
    return { ...move, score };
  });

  evaluatedMoves.sort((a, b) => b.score - a.score);

  return evaluatedMoves[0];
}

function calculateMasterMove(
  allMoves: MoveWithCaptures[],
  board: BoardState,
  aiColor: PieceColor,
  variant: Variant
): MoveWithCaptures {
  const evaluatedMoves: EvaluatedMove[] = allMoves.map((move) => {
    const newBoard = applyMove(board, move, variant);
    const score = minimax(
      newBoard,
      AI_SETTINGS.DEPTH.MASTER - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      variant,
      true
    );
    return { ...move, score };
  });

  evaluatedMoves.sort((a, b) => b.score - a.score);

  return evaluatedMoves[0];
}

export function calculateAIMove(
  board: BoardState,
  aiColor: PieceColor,
  difficulty: Difficulty,
  variant: Variant
): MoveWithCaptures | null {
  const allMoves = getAllValidMoves(board, aiColor, variant);

  if (allMoves.length === 0) return null;

  switch (difficulty) {
    case 1:
      return calculateEasyMove(allMoves);
    case 2:
      return calculateMediumMove(allMoves, board, aiColor, variant);
    case 3:
      return calculateHardMove(allMoves, board, aiColor, variant);
    case 4:
      return calculateMasterMove(allMoves, board, aiColor, variant);
    default:
      return calculateEasyMove(allMoves);
  }
}
