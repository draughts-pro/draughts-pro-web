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

// Transposition table entry
interface TTEntry {
  depth: number;
  score: number;
  flag: "exact" | "lowerbound" | "upperbound";
}

// Simple board hashing using Zobrist-like approach
function hashBoard(board: BoardState, currentColor: PieceColor): string {
  let hash = currentColor;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        hash += `${row},${col}:${piece.color}${piece.isKing ? "K" : ""}|`;
      }
    }
  }
  return hash;
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

// Order moves for better alpha-beta pruning
function orderMoves(
  moves: MoveWithCaptures[],
  board: BoardState
): MoveWithCaptures[] {
  return moves
    .map((move) => {
      let priority = 0;

      // Captures are high priority, more captures = higher priority
      priority += move.capturedPieces.length * 100;

      // Promotions are valuable
      const piece = getPieceAt(board, move.from);
      if (piece && !piece.isKing) {
        const promotionRow =
          piece.color === "dark" ? board.length - 1 : 0;
        if (move.to.row === promotionRow) {
          priority += 50;
        }
        // Advancing toward promotion
        const progressBefore =
          piece.color === "dark" ? move.from.row : board.length - 1 - move.from.row;
        const progressAfter =
          piece.color === "dark" ? move.to.row : board.length - 1 - move.to.row;
        priority += (progressAfter - progressBefore) * 5;
      }

      // Center control is slightly preferred
      const centerCol = board[0].length / 2;
      const centerDistance = Math.abs(move.to.col - centerCol);
      priority += (centerCol - centerDistance) * 2;

      return { move, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .map((m) => m.move);
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

    // Mobility bonus: having more move options is good
    const myMoves = getAllValidMoves(board, color, variant).length;
    const oppColor = color === "dark" ? "light" : "dark";
    const oppMoves = getAllValidMoves(board, oppColor, variant).length;
    score += (myMoves - oppMoves) * 0.1;

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

// Quiescence search: continue searching captures until position is "quiet"
function quiescence(
  board: BoardState,
  alpha: number,
  beta: number,
  aiColor: PieceColor,
  currentColor: PieceColor,
  variant: Variant,
  useAdvancedEval: boolean,
  maxQuiesceDepth: number = 4
): number {
  const standPat = evaluateBoard(board, aiColor, variant, useAdvancedEval);
  const maximizing = currentColor === aiColor;

  if (maxQuiesceDepth === 0) {
    return standPat;
  }

  if (maximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;
  }

  const allMoves = getAllValidMoves(board, currentColor, variant);
  const captureMoves = allMoves.filter((m) => m.capturedPieces.length > 0);

  // If no captures, position is quiet
  if (captureMoves.length === 0) {
    return standPat;
  }

  const oppColor = currentColor === "dark" ? "light" : "dark";

  if (maximizing) {
    for (const move of captureMoves) {
      const newBoard = applyMove(board, move, variant);
      const score = quiescence(
        newBoard,
        alpha,
        beta,
        aiColor,
        oppColor,
        variant,
        useAdvancedEval,
        maxQuiesceDepth - 1
      );
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return alpha;
  } else {
    for (const move of captureMoves) {
      const newBoard = applyMove(board, move, variant);
      const score = quiescence(
        newBoard,
        alpha,
        beta,
        aiColor,
        oppColor,
        variant,
        useAdvancedEval,
        maxQuiesceDepth - 1
      );
      if (score < beta) beta = score;
      if (alpha >= beta) break;
    }
    return beta;
  }
}

function minimax(
  board: BoardState,
  depth: number,
  maxDepth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiColor: PieceColor,
  variant: Variant,
  useAdvancedEval: boolean = false,
  transpositionTable: Map<string, TTEntry> | null = null,
  useQuiescence: boolean = false
): number {
  const currentColor = maximizingPlayer
    ? aiColor
    : aiColor === "dark"
      ? "light"
      : "dark";

  // Check transposition table
  const boardHash = transpositionTable
    ? hashBoard(board, currentColor)
    : null;

  if (boardHash && transpositionTable) {
    const ttEntry = transpositionTable.get(boardHash);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === "exact") {
        return ttEntry.score;
      } else if (ttEntry.flag === "lowerbound") {
        alpha = Math.max(alpha, ttEntry.score);
      } else if (ttEntry.flag === "upperbound") {
        beta = Math.min(beta, ttEntry.score);
      }
      if (alpha >= beta) {
        return ttEntry.score;
      }
    }
  }

  if (depth === 0) {
    if (useQuiescence) {
      return quiescence(
        board,
        alpha,
        beta,
        aiColor,
        currentColor,
        variant,
        useAdvancedEval
      );
    }
    return evaluateBoard(board, aiColor, variant, useAdvancedEval);
  }

  let allMoves = getAllValidMoves(board, currentColor, variant);

  if (allMoves.length === 0) {
    // Prefer winning sooner, losing later
    const mateScore = maximizingPlayer
      ? -10000 + (maxDepth - depth)
      : 10000 - (maxDepth - depth);
    return mateScore;
  }

  // Order moves for better pruning
  allMoves = orderMoves(allMoves, board);

  let bestScore: number;
  let ttFlag: "exact" | "lowerbound" | "upperbound";

  if (maximizingPlayer) {
    bestScore = -Infinity;
    ttFlag = "upperbound";

    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        maxDepth,
        alpha,
        beta,
        false,
        aiColor,
        variant,
        useAdvancedEval,
        transpositionTable,
        useQuiescence
      );
      if (evaluation > bestScore) {
        bestScore = evaluation;
      }
      if (bestScore > alpha) {
        alpha = bestScore;
        ttFlag = "exact";
      }
      if (beta <= alpha) {
        ttFlag = "lowerbound";
        break;
      }
    }
  } else {
    bestScore = Infinity;
    ttFlag = "upperbound";

    for (const move of allMoves) {
      const newBoard = applyMove(board, move, variant);
      const evaluation = minimax(
        newBoard,
        depth - 1,
        maxDepth,
        alpha,
        beta,
        true,
        aiColor,
        variant,
        useAdvancedEval,
        transpositionTable,
        useQuiescence
      );
      if (evaluation < bestScore) {
        bestScore = evaluation;
      }
      if (bestScore < beta) {
        beta = bestScore;
        ttFlag = "exact";
      }
      if (beta <= alpha) {
        ttFlag = "lowerbound";
        break;
      }
    }
  }

  // Store in transposition table
  if (boardHash && transpositionTable) {
    transpositionTable.set(boardHash, {
      depth,
      score: bestScore,
      flag: ttFlag,
    });
  }

  return bestScore;
}

// Iterative deepening wrapper
function iterativeDeepening(
  board: BoardState,
  aiColor: PieceColor,
  variant: Variant,
  maxDepth: number,
   initialMoves: MoveWithCaptures[], 
  useAdvancedEval: boolean = false,
  useQuiescence: boolean = false
): EvaluatedMove[] {
  let allMoves = orderMoves(initialMoves, board);

  let evaluatedMoves: EvaluatedMove[] = allMoves.map((move) => ({
    ...move,
    score: 0,
  }));

  const transpositionTable = new Map<string, TTEntry>();

  // Search at increasing depths
  for (let depth = 1; depth <= maxDepth; depth++) {
    const newEvaluations: EvaluatedMove[] = [];

    for (const move of evaluatedMoves) {
      const newBoard = applyMove(board, move, variant);
      const score = minimax(
        newBoard,
        depth - 1,
        depth,
        -Infinity,
        Infinity,
        false,
        aiColor,
        variant,
        useAdvancedEval,
        transpositionTable,
        useQuiescence
      );
      newEvaluations.push({
        from: move.from,
        to: move.to,
        capturedPieces: move.capturedPieces,
        score,
      });
    }

    // Sort by score for next iteration (best moves first)
    newEvaluations.sort((a, b) => b.score - a.score);
    evaluatedMoves = newEvaluations;
  }

  return evaluatedMoves;
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
  const evaluatedMoves = iterativeDeepening(
    board,
    aiColor,
    variant,
    AI_SETTINGS.DEPTH.MEDIUM,
    allMoves,
  );

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
  const evaluatedMoves = iterativeDeepening(
    board,
    aiColor,
    variant,
    AI_SETTINGS.DEPTH.HARD,
    allMoves,
    false,
    true // Enable quiescence
  );

  return evaluatedMoves[0];
}

function calculateMasterMove(
  allMoves: MoveWithCaptures[],
  board: BoardState,
  aiColor: PieceColor,
  variant: Variant
): MoveWithCaptures {
  const evaluatedMoves = iterativeDeepening(
    board,
    aiColor,
    variant,
    AI_SETTINGS.DEPTH.MASTER,
    allMoves,
    true, // Advanced evaluation
    true  // Enable quiescence
  );

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
