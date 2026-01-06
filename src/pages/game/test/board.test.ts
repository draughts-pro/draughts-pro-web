import { variants } from "../../settings/utils/variants";
import {
  cloneBoard,
  countPieces,
  createInitialBoard,
  getPieceAt,
  isValidPosition,
  positionsEqual,
  setPieceAt,
} from "../utils/board";
import type { BoardState } from "../utils/state";

describe("Board Utilities", () => {
  describe("createInitialBoard", () => {
    it("should create a valid American checkers board", () => {
      const board = createInitialBoard(variants.american);

      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);

      const counts = countPieces(board);
      expect(counts.dark).toBe(12);
      expect(counts.light).toBe(12);
    });

    it("should create a valid International checkers board", () => {
      const board = createInitialBoard(variants.international);

      expect(board.length).toBe(10);
      expect(board[0].length).toBe(10);

      const counts = countPieces(board);
      expect(counts.dark).toBe(20);
      expect(counts.light).toBe(20);
    });

    it("should place pieces only on dark squares for variants using dark squares", () => {
      const board = createInitialBoard(variants.american);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < board[row].length; col++) {
          const piece = board[row][col];
          if (piece) {
            // American checkers: bottomLeftSquareColor is "dark", so dark squares are (row + col) % 2 === 0
            const isDarkSquare = (row + col) % 2 === 0;
            expect(isDarkSquare).toBe(true);
          }
        }
      }
    });
  });

  describe("isValidPosition", () => {
    const board = createInitialBoard(variants.american);

    it("should return true for valid positions", () => {
      expect(isValidPosition({ row: 0, col: 0 }, board)).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 }, board)).toBe(true);
      expect(isValidPosition({ row: 3, col: 4 }, board)).toBe(true);
    });

    it("should return false for out of bounds positions", () => {
      expect(isValidPosition({ row: -1, col: 0 }, board)).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 }, board)).toBe(false);
      expect(isValidPosition({ row: 8, col: 0 }, board)).toBe(false);
      expect(isValidPosition({ row: 0, col: 8 }, board)).toBe(false);
    });
  });

  describe("getPieceAt", () => {
    const board = createInitialBoard(variants.american);

    it("should return the correct piece at a position", () => {
      // American checkers: pieces on dark squares, row 0, col 0 is dark (0+0=0, even)
      const piece = getPieceAt(board, { row: 0, col: 0 });
      expect(piece).not.toBeNull();
      expect(piece?.color).toBe("dark");
      expect(piece?.isKing).toBe(false);
    });

    it("should return null for empty squares", () => {
      const piece = getPieceAt(board, { row: 3, col: 0 });
      expect(piece).toBeNull();
    });

    it("should return null for invalid positions", () => {
      const piece = getPieceAt(board, { row: -1, col: 0 });
      expect(piece).toBeNull();
    });
  });

  describe("setPieceAt", () => {
    it("should set a piece at a position", () => {
      const board = createInitialBoard(variants.american);
      const newBoard = setPieceAt(
        board,
        { row: 3, col: 2 },
        { color: "dark", isKing: false }
      );

      expect(getPieceAt(newBoard, { row: 3, col: 2 })).toEqual({
        color: "dark",
        isKing: false,
      });
    });

    it("should not mutate the original board", () => {
      const board = createInitialBoard(variants.american);
      const originalPiece = getPieceAt(board, { row: 0, col: 1 });

      const newBoard = setPieceAt(board, { row: 0, col: 1 }, null);

      expect(getPieceAt(board, { row: 0, col: 1 })).toEqual(originalPiece);
      expect(getPieceAt(newBoard, { row: 0, col: 1 })).toBeNull();
    });
  });

  describe("positionsEqual", () => {
    it("should return true for equal positions", () => {
      expect(positionsEqual({ row: 2, col: 3 }, { row: 2, col: 3 })).toBe(true);
    });

    it("should return false for different positions", () => {
      expect(positionsEqual({ row: 2, col: 3 }, { row: 2, col: 4 })).toBe(
        false
      );
      expect(positionsEqual({ row: 2, col: 3 }, { row: 3, col: 3 })).toBe(
        false
      );
    });

    it("should return false if either position is null", () => {
      expect(positionsEqual(null, { row: 2, col: 3 })).toBe(false);
      expect(positionsEqual({ row: 2, col: 3 }, null)).toBe(false);
      expect(positionsEqual(null, null)).toBe(false);
    });
  });

  describe("cloneBoard", () => {
    it("should create a deep copy of the board", () => {
      const board = createInitialBoard(variants.american);
      const clone = cloneBoard(board);

      expect(clone).toEqual(board);
      expect(clone).not.toBe(board);
      expect(clone[0]).not.toBe(board[0]);
    });

    it("should not affect original when modified", () => {
      const board = createInitialBoard(variants.american);
      const clone = cloneBoard(board);

      clone[0][0] = null;

      expect(board[0][0]).not.toBeNull();
    });
  });

  describe("countPieces", () => {
    it("should count pieces correctly on a full board", () => {
      const board = createInitialBoard(variants.american);
      const counts = countPieces(board);

      expect(counts.dark).toBe(12);
      expect(counts.light).toBe(12);
    });

    it("should count pieces correctly on a modified board", () => {
      const board = createInitialBoard(variants.american);
      const modifiedBoard = setPieceAt(board, { row: 0, col: 0 }, null);
      const counts = countPieces(modifiedBoard);

      expect(counts.dark).toBe(11);
      expect(counts.light).toBe(12);
    });

    it("should return zero for an empty board", () => {
      const board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      const counts = countPieces(board);

      expect(counts.dark).toBe(0);
      expect(counts.light).toBe(0);
    });
  });
});
