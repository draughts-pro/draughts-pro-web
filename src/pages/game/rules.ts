import type { Variant } from "../settings/variants";
import { getPieceAt, isValidPosition } from "./board";
import type { BoardState, Piece, PieceColor, Position } from "./state";

export interface MoveWithCaptures {
  to: Position;
  capturedPieces: Position[];
}

export function getValidMoves(
  board: BoardState,
  pos: Position,
  mustCapture: boolean = false,
  variant: Variant
): MoveWithCaptures[] {
  const piece = getPieceAt(board, pos);
  if (!piece) return [];

  const captures = getCaptureMovesFromPosition(board, pos, piece, [], variant);

  // If forced capture is active, only return capture moves
  if (mustCapture) {
    return captures.length > 0
      ? filterMaximumCaptures(captures, variant, board)
      : [];
  }

  // Otherwise, prefer captures if available, else return simple moves
  if (captures.length > 0) {
    return filterMaximumCaptures(captures, variant, board);
  }

  return getSimpleMovesFromPosition(board, pos, piece, variant);
}

function filterMaximumCaptures(
  captures: MoveWithCaptures[],
  variant: Variant,
  board?: BoardState
): MoveWithCaptures[] {
  if (!variant.mustCaptureMaximum || captures.length === 0) {
    return captures;
  }

  // Find the maximum capture value
  let maxCaptureValue = 0;
  for (const capture of captures) {
    let captureValue = 0;

    if (variant.captureCountsKingsMore && board) {
      // Count kings as more valuable than regular pieces
      for (const capturedPos of capture.capturedPieces) {
        const capturedPiece = getPieceAt(board, capturedPos);
        if (capturedPiece) {
          captureValue += capturedPiece.isKing ? 2 : 1;
        }
      }
    } else {
      captureValue = capture.capturedPieces.length;
    }

    if (captureValue > maxCaptureValue) {
      maxCaptureValue = captureValue;
    }
  }

  // Return only moves that capture the maximum value
  return captures.filter((c) => {
    let captureValue = 0;

    if (variant.captureCountsKingsMore && board) {
      for (const capturedPos of c.capturedPieces) {
        const capturedPiece = getPieceAt(board, capturedPos);
        if (capturedPiece) {
          captureValue += capturedPiece.isKing ? 2 : 1;
        }
      }
    } else {
      captureValue = c.capturedPieces.length;
    }

    return captureValue === maxCaptureValue;
  });
}

function getSimpleMovesFromPosition(
  board: BoardState,
  pos: Position,
  piece: Piece,
  variant: Variant
): MoveWithCaptures[] {
  const moves: MoveWithCaptures[] = [];
  const directions = getMoveDirections(piece, variant);
  const maxDistance =
    piece.isKing && variant.kingMoveDistance === "unlimited" ? board.length : 1;

  for (const dir of directions) {
    for (let distance = 1; distance <= maxDistance; distance++) {
      const newRow = pos.row + dir.row * distance;
      const newCol = pos.col + dir.col * distance;
      const newPos = { row: newRow, col: newCol };

      if (!isValidPosition(newPos, board)) break;

      const targetPiece = getPieceAt(board, newPos);
      if (targetPiece) break;

      moves.push({ to: newPos, capturedPieces: [] });
    }
  }

  return moves;
}

function getCaptureMovesFromPosition(
  board: BoardState,
  pos: Position,
  piece: Piece,
  capturedSoFar: Position[] = [],
  variant: Variant,
  visitedSquares: Position[] = []
): MoveWithCaptures[] {
  const allCaptures: MoveWithCaptures[] = [];
  const directions = getCaptureDirections(piece, variant);
  const maxDistance =
    piece.isKing && variant.kingCaptureDistance === "unlimited"
      ? board.length
      : 1;

  for (const dir of directions) {
    for (let distance = 1; distance <= maxDistance; distance++) {
      const jumpedRow = pos.row + dir.row * distance;
      const jumpedCol = pos.col + dir.col * distance;
      const jumpedPos = { row: jumpedRow, col: jumpedCol };

      if (!isValidPosition(jumpedPos, board)) break;

      const jumpedPiece = getPieceAt(board, jumpedPos);

      if (!jumpedPiece) continue;

      if (jumpedPiece.color === piece.color) break;

      const alreadyCaptured = capturedSoFar.some(
        (p) => p.row === jumpedPos.row && p.col === jumpedPos.col
      );

      if (alreadyCaptured) break;

      for (let landDistance = 1; landDistance <= maxDistance; landDistance++) {
        const landRow = jumpedPos.row + dir.row * landDistance;
        const landCol = jumpedPos.col + dir.col * landDistance;
        const landPos = { row: landRow, col: landCol };

        if (!isValidPosition(landPos, board)) break;

        const landPiece = getPieceAt(board, landPos);
        if (landPiece) break;

        // Check if we've already visited this square (if not allowed)
        if (!variant.canPassOverSameSquareTwice) {
          const alreadyVisited = visitedSquares.some(
            (p) => p.row === landPos.row && p.col === landPos.col
          );
          if (alreadyVisited) continue;
        }

        const newCaptured = [...capturedSoFar, jumpedPos];
        const newVisited = [...visitedSquares, landPos];

        // Check if piece gets promoted at this landing position
        const wouldPromote =
          !piece.isKing &&
          ((piece.color === "dark" && landPos.row === board.length - 1) ||
            (piece.color === "light" && landPos.row === 0));

        if (
          variant.canCaptureMultiple &&
          !(wouldPromote && variant.promotionInterruptsCapture)
        ) {
          const tempBoard = board.map((row) => [...row]);

          // Determine if piece should be promoted for further capture calculation
          let pieceForFurtherCaptures = piece;
          if (wouldPromote && variant.promotesToKingMidCapture) {
            pieceForFurtherCaptures = { ...piece, isKing: true };
          }

          tempBoard[landPos.row][landPos.col] = pieceForFurtherCaptures;
          tempBoard[pos.row][pos.col] = null;

          if (variant.capturedPiecesRemovedWhen === "immediately") {
            newCaptured.forEach((cp) => {
              tempBoard[cp.row][cp.col] = null;
            });
          }

          const furtherCaptures = getCaptureMovesFromPosition(
            tempBoard,
            landPos,
            pieceForFurtherCaptures,
            newCaptured,
            variant,
            newVisited
          );

          if (furtherCaptures.length > 0) {
            allCaptures.push(...furtherCaptures);
          } else {
            allCaptures.push({ to: landPos, capturedPieces: newCaptured });
          }
        } else {
          allCaptures.push({ to: landPos, capturedPieces: newCaptured });
        }
      }

      break;
    }
  }

  return allCaptures;
}

function getMoveDirections(piece: Piece, variant: Variant): Position[] {
  if (piece.isKing) {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  if (variant.menMoveDirection === "both") {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  if (piece.color === "dark") {
    return [
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  return [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
  ];
}

function getCaptureDirections(piece: Piece, variant: Variant): Position[] {
  if (piece.isKing) {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  if (variant.menCaptureDirection === "both") {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  if (piece.color === "dark") {
    return [
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  return [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
  ];
}

export function hasAnyCaptures(
  board: BoardState,
  color: PieceColor,
  variant: Variant
): boolean {
  const boardSize = board.length;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const captures = getCaptureMovesFromPosition(
          board,
          { row, col },
          piece,
          [],
          variant
        );
        if (captures.length > 0) return true;
      }
    }
  }
  return false;
}

export function getAllValidMoves(
  board: BoardState,
  color: PieceColor,
  variant: Variant
): { from: Position; moves: MoveWithCaptures[] }[] {
  const mustCapture =
    variant.forcedCapture && hasAnyCaptures(board, color, variant);
  const allMoves: { from: Position; moves: MoveWithCaptures[] }[] = [];
  const boardSize = board.length;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col }, mustCapture, variant);
        if (moves.length > 0) {
          allMoves.push({ from: { row, col }, moves });
        }
      }
    }
  }

  return allMoves;
}

export function hasValidMoves(
  board: BoardState,
  color: PieceColor,
  variant: Variant
): boolean {
  return getAllValidMoves(board, color, variant).length > 0;
}

export function checkGameOver(
  board: BoardState,
  currentTurn: PieceColor,
  variant: Variant
): { isOver: boolean; winner: PieceColor | null; reason: "capture" | "noMoves" | null } {
  const currentPlayerHasMoves = hasValidMoves(board, currentTurn, variant);

  if (!currentPlayerHasMoves) {
    const winner = currentTurn === "dark" ? "light" : "dark";
    return { isOver: true, winner, reason: "noMoves" };
  }

  // Check if opponent has any pieces left
  const opponentColor = currentTurn === "dark" ? "light" : "dark";
  let opponentHasPieces = false;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        opponentHasPieces = true;
        break;
      }
    }
    if (opponentHasPieces) break;
  }

  if (!opponentHasPieces) {
    return { isOver: true, winner: currentTurn, reason: "capture" };
  }

  return { isOver: false, winner: null, reason: null };
}
