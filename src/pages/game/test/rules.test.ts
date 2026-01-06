import { variants } from "../../settings/utils/variants";
import { createInitialBoard, setPieceAt } from "../utils/board";
import { checkGameOver, getValidMoves, hasAnyCaptures } from "../utils/rules";
import type { BoardState } from "../utils/state";

describe("Game Rules", () => {
  describe("getValidMoves", () => {
    it("should allow regular pieces to move forward diagonally", () => {
      const board = createInitialBoard(variants.american);
      // Row 2, col 0 has a dark piece (2+0=2, even)
      const moves = getValidMoves(
        board,
        { row: 2, col: 0 },
        false,
        variants.american
      );

      expect(moves.length).toBeGreaterThan(0);
      moves.forEach((move) => {
        expect(move.to.row).toBeGreaterThan(2);
      });
    });

    it("should not allow regular pieces to move backwards in American checkers", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 4, col: 3 },
        { color: "light", isKing: false }
      );

      const moves = getValidMoves(
        board,
        { row: 4, col: 3 },
        false,
        variants.american
      );

      moves.forEach((move) => {
        expect(move.to.row).toBeLessThan(4);
      });
    });

    it("should allow kings to move in all directions", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 4, col: 4 },
        { color: "dark", isKing: true }
      );

      const moves = getValidMoves(
        board,
        { row: 4, col: 4 },
        false,
        variants.american
      );

      const hasForward = moves.some((m) => m.to.row > 4);
      const hasBackward = moves.some((m) => m.to.row < 4);

      expect(hasForward).toBe(true);
      expect(hasBackward).toBe(true);
    });

    it("should detect simple capture moves", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 3, col: 3 },
        { color: "dark", isKing: false }
      );

      const moves = getValidMoves(
        board,
        { row: 2, col: 2 },
        false,
        variants.american
      );

      const captureMove = moves.find((m) => m.capturedPieces.length > 0);
      expect(captureMove).toBeDefined();
      expect(captureMove?.to.row).toBe(4);
      expect(captureMove?.to.col).toBe(4);
    });

    it("should enforce forced capture when variant requires it", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 3, col: 3 },
        { color: "dark", isKing: false }
      );

      const moves = getValidMoves(
        board,
        { row: 2, col: 2 },
        true,
        variants.american
      );

      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every((m) => m.capturedPieces.length > 0)).toBe(true);
    });

    it("should allow multi-jump captures when variant permits", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 3, col: 3 },
        { color: "dark", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 5, col: 5 },
        { color: "dark", isKing: false }
      );

      const moves = getValidMoves(
        board,
        { row: 2, col: 2 },
        false,
        variants.american
      );

      const multiJump = moves.find((m) => m.capturedPieces.length > 1);
      if (variants.american.canCaptureMultiple) {
        expect(multiJump).toBeDefined();
      }
    });
  });

  describe("hasAnyCaptures", () => {
    it("should return true when captures are available", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 3, col: 3 },
        { color: "dark", isKing: false }
      );

      expect(hasAnyCaptures(board, "light", variants.american)).toBe(true);
    });

    it("should return false when no captures are available", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );

      expect(hasAnyCaptures(board, "light", variants.american)).toBe(false);
    });
  });

  describe("checkGameOver", () => {
    it("should detect when a player has no pieces", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "dark", isKing: false }
      );

      // Light has no pieces, dark's turn
      const result = checkGameOver(board, "dark", variants.american);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe("dark");
      expect(result.reason).toBe("capture");
    });

    it("should detect when a player has no valid moves", () => {
      let board: BoardState = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      // Dark piece trapped in corner with light pieces blocking
      board = setPieceAt(
        board,
        { row: 0, col: 0 },
        { color: "dark", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 1, col: 1 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 2, col: 2 },
        { color: "light", isKing: false }
      );
      board = setPieceAt(
        board,
        { row: 7, col: 7 },
        { color: "light", isKing: true }
      );

      const result = checkGameOver(board, "dark", variants.american);

      expect(result.isOver).toBe(true);
      expect(result.winner).toBe("light");
      expect(result.reason).toBe("noMoves");
    });

    it("should return not over when game is still playable", () => {
      const board = createInitialBoard(variants.american);

      const result = checkGameOver(board, "light", variants.american);

      expect(result.isOver).toBe(false);
      expect(result.winner).toBeNull();
      expect(result.reason).toBeNull();
    });
  });
});
