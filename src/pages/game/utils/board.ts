import type { Variant } from "../../settings/utils/variants";
import type { BoardState, Piece, Position } from "./state";

export function createInitialBoard(variant: Variant): BoardState {
  const { boardSize, startingRows, darkSquaresUsed, bottomLeftSquareColor } =
    variant;

  const board: BoardState = Array(boardSize)
    .fill(null)
    .map(() => Array(boardSize).fill(null));

  const shouldPlacePiece = (row: number, col: number) => {
    if (!darkSquaresUsed) return true;

    const isDarkSquare =
      bottomLeftSquareColor === "dark"
        ? (row + col) % 2 === 0
        : (row + col) % 2 === 1;

    return isDarkSquare;
  };

  for (let row = 0; row < startingRows; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (shouldPlacePiece(row, col)) {
        board[row][col] = { color: "dark", isKing: false };
      }
    }
  }

  for (let row = boardSize - startingRows; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (shouldPlacePiece(row, col)) {
        board[row][col] = { color: "light", isKing: false };
      }
    }
  }

  return board;
}

export function isValidPosition(pos: Position, board: BoardState): boolean {
  const boardSize = board.length;
  return (
    pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize
  );
}

export function getPieceAt(board: BoardState, pos: Position): Piece | null {
  if (!isValidPosition(pos, board)) return null;
  return board[pos.row][pos.col];
}

export function setPieceAt(
  board: BoardState,
  pos: Position,
  piece: Piece | null
): BoardState {
  const newBoard = board.map((row) => [...row]);
  newBoard[pos.row][pos.col] = piece;
  return newBoard;
}

export function positionsEqual(
  pos1: Position | null,
  pos2: Position | null
): boolean {
  if (!pos1 || !pos2) return false;
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => [...row]);
}

export function countPieces(board: BoardState): {
  dark: number;
  light: number;
} {
  let dark = 0;
  let light = 0;

  const boardSize = board.length;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.color === "dark") dark++;
        else light++;
      }
    }
  }

  return { dark, light };
}
