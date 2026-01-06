import { variants } from "../../settings/utils/variants";
import { createInitialBoard, setPieceAt } from "../utils/board";
import { checkGameOver, getValidMoves } from "../utils/rules";
import type { BoardState } from "../utils/state";

describe("Variant-Specific Rules", () => {
  describe("Movement Rules", () => {
    describe("menMoveDirection", () => {
      it("American: men should only move forward", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 4, col: 4 },
          false,
          variants.american
        );

        // Light pieces move toward row 0, so all moves should have row < 4
        expect(moves.every((m) => m.to.row < 4)).toBe(true);
      });

      it("Nigerian: men should only move forward", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 5, col: 5 },
          false,
          variants.nigerian
        );

        // Dark pieces move toward higher rows, so all moves should have row > 5
        expect(moves.every((m) => m.to.row > 5)).toBe(true);
      });
    });

    describe("menCaptureDirection", () => {
      it("American: men can capture in both diagonal directions", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: false }
        );
        board = setPieceAt(
          board,
          { row: 3, col: 3 },
          { color: "dark", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 4, col: 4 },
          false,
          variants.american
        );
        const captureMove = moves.find((m) => m.capturedPieces.length > 0);

        expect(captureMove).toBeDefined();
        expect(captureMove?.to.row).toBe(2);
      });
    });

    describe("kingMoveDistance", () => {
      it("American: kings should move only 1 square", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: true }
        );

        const moves = getValidMoves(
          board,
          { row: 4, col: 4 },
          false,
          variants.american
        );

        // All moves should be exactly 1 square away
        expect(
          moves.every(
            (m) => Math.abs(m.to.row - 4) === 1 && Math.abs(m.to.col - 4) === 1
          )
        ).toBe(true);
      });

      it("International: kings should move unlimited distance", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 0, col: 0 },
          { color: "light", isKing: true }
        );

        const moves = getValidMoves(
          board,
          { row: 0, col: 0 },
          false,
          variants.international
        );

        // Should be able to move to far squares
        const longMove = moves.find((m) => Math.abs(m.to.row - 0) > 1);
        expect(longMove).toBeDefined();
      });

      it("Nigerian: kings should move unlimited distance", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: true }
        );

        const moves = getValidMoves(
          board,
          { row: 5, col: 5 },
          false,
          variants.nigerian
        );

        // Should be able to move multiple squares
        const longMove = moves.find((m) => Math.abs(m.to.row - 5) > 1);
        expect(longMove).toBeDefined();
      });
    });

    describe("kingCaptureDistance", () => {
      it("American: kings should capture at distance 1", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: true }
        );
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 4, col: 4 },
          false,
          variants.american
        );
        const captureMove = moves.find((m) => m.capturedPieces.length > 0);

        expect(captureMove).toBeDefined();
        expect(captureMove?.to.row).toBe(6);
      });

      it("International: kings should capture at unlimited distance", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 0, col: 0 },
          { color: "light", isKing: true }
        );
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 0, col: 0 },
          false,
          variants.international
        );
        const captureMove = moves.find((m) => m.capturedPieces.length > 0);

        expect(captureMove).toBeDefined();
        // King should be able to land beyond the captured piece
        expect(captureMove?.to.row).toBeGreaterThan(5);
      });
    });
  });

  describe("Capture Rules", () => {
    describe("forcedCapture", () => {
      it("American: should enforce forced capture", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: false }
        );
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: false }
        );

        const moves = getValidMoves(
          board,
          { row: 4, col: 4 },
          true,
          variants.american
        );

        // When forced capture is true, should only return capture moves
        expect(moves.every((m) => m.capturedPieces.length > 0)).toBe(true);
      });

      it("All variants: should have forcedCapture enabled", () => {
        expect(variants.american.forcedCapture).toBe(true);
        expect(variants.international.forcedCapture).toBe(true);
        expect(variants.nigerian.forcedCapture).toBe(true);
      });
    });

    describe("mustCaptureMaximum", () => {
      it("American: should not require maximum capture", () => {
        expect(variants.american.mustCaptureMaximum).toBe(false);
      });

      it("International: should require maximum capture", () => {
        expect(variants.international.mustCaptureMaximum).toBe(true);
      });

      it("Nigerian: should not require maximum capture", () => {
        expect(variants.nigerian.mustCaptureMaximum).toBe(false);
      });
    });

    describe("canCaptureMultiple", () => {
      it("American: should allow multi-jump captures", () => {
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

        expect(multiJump).toBeDefined();
      });

      it("All variants: should allow multiple captures", () => {
        expect(variants.american.canCaptureMultiple).toBe(true);
        expect(variants.international.canCaptureMultiple).toBe(true);
        expect(variants.nigerian.canCaptureMultiple).toBe(true);
      });
    });

    describe("capturedPiecesRemovedWhen", () => {
      it("American: should remove pieces immediately", () => {
        expect(variants.american.capturedPiecesRemovedWhen).toBe("immediately");
      });

      it("International: should remove pieces after sequence", () => {
        expect(variants.international.capturedPiecesRemovedWhen).toBe(
          "afterSequence"
        );
      });

      it("Nigerian: should remove pieces after sequence", () => {
        expect(variants.nigerian.capturedPiecesRemovedWhen).toBe(
          "afterSequence"
        );
      });
    });

    describe("canPassOverSameSquareTwice", () => {
      it("American: should not allow passing over same square twice", () => {
        expect(variants.american.canPassOverSameSquareTwice).toBe(false);
      });

      it("International: should allow passing over same square twice", () => {
        expect(variants.international.canPassOverSameSquareTwice).toBe(true);
      });
    });
  });

  describe("Promotion Rules", () => {
    describe("promotionInterruptsCapture", () => {
      it("American: promotion should interrupt capture sequence", () => {
        expect(variants.american.promotionInterruptsCapture).toBe(true);
      });

      it("International: promotion should not interrupt capture", () => {
        expect(variants.international.promotionInterruptsCapture).toBe(false);
      });
    });

    describe("promotesToKingMidCapture", () => {
      it("American: should promote to king mid-capture", () => {
        expect(variants.american.promotesToKingMidCapture).toBe(true);
      });

      it("International: should not promote to king mid-capture", () => {
        expect(variants.international.promotesToKingMidCapture).toBe(false);
      });
    });
  });

  describe("Win Conditions", () => {
    describe("captureAll", () => {
      it("American: should end game when all pieces captured", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        board = setPieceAt(
          board,
          { row: 4, col: 4 },
          { color: "light", isKing: false }
        );

        const result = checkGameOver(board, "light", variants.american);

        expect(result.isOver).toBe(true);
        expect(result.winner).toBe("light");
        expect(result.reason).toBe("capture");
      });

      it("International: should end game when all pieces captured", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 5, col: 5 },
          { color: "dark", isKing: true }
        );

        const result = checkGameOver(board, "dark", variants.international);

        expect(result.isOver).toBe(true);
        expect(result.winner).toBe("dark");
        expect(result.reason).toBe("capture");
      });

      it("Nigerian: should end game when all pieces captured", () => {
        let board: BoardState = Array(10)
          .fill(null)
          .map(() => Array(10).fill(null));
        board = setPieceAt(
          board,
          { row: 3, col: 3 },
          { color: "light", isKing: false }
        );

        const result = checkGameOver(board, "light", variants.nigerian);

        expect(result.isOver).toBe(true);
        expect(result.winner).toBe("light");
        expect(result.reason).toBe("capture");
      });
    });

    describe("blockAll", () => {
      it("American: should end game when player has no valid moves", () => {
        let board: BoardState = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        // Single dark piece completely trapped - cannot move forward
        // Dark regular piece at (1,1) - in American checkers, dark moves downward
        // But wait - we need to test on dark squares only. (row+col) % 2 === 0
        board = setPieceAt(
          board,
          { row: 1, col: 1 },
          { color: "dark", isKing: false }
        );
        // Block both forward diagonal moves (row 2, cols 0 and 2)
        board = setPieceAt(
          board,
          { row: 2, col: 0 },
          { color: "light", isKing: false }
        );
        board = setPieceAt(
          board,
          { row: 2, col: 2 },
          { color: "light", isKing: false }
        );
        // Block potential capture squares (row 3, cols 1) - but first put pieces at row 3
        // to prevent captures. If dark tries to jump (2,0), it would land at (3,1) - block that
        board = setPieceAt(
          board,
          { row: 3, col: 1 },
          { color: "light", isKing: false }
        );
        // Similarly for the other direction - jumping (2,2) would land at (3,3)
        board = setPieceAt(
          board,
          { row: 3, col: 3 },
          { color: "light", isKing: false }
        );
        // Add a light king far away so light still has pieces
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
    });

    describe("winConditions coverage", () => {
      it("All variants: should have both captureAll and blockAll conditions", () => {
        expect(variants.american.winConditions).toContain("captureAll");
        expect(variants.american.winConditions).toContain("blockAll");

        expect(variants.international.winConditions).toContain("captureAll");
        expect(variants.international.winConditions).toContain("blockAll");

        expect(variants.nigerian.winConditions).toContain("captureAll");
        expect(variants.nigerian.winConditions).toContain("blockAll");
      });
    });
  });

  describe("Board Setup Verification", () => {
    it("American: should create 8x8 board with 12 pieces per player", () => {
      const board = createInitialBoard(variants.american);
      expect(board.length).toBe(8);
      expect(variants.american.piecesPerPlayer).toBe(12);
      expect(variants.american.startingRows).toBe(3);
    });

    it("International: should create 10x10 board with 20 pieces per player", () => {
      const board = createInitialBoard(variants.international);
      expect(board.length).toBe(10);
      expect(variants.international.piecesPerPlayer).toBe(20);
      expect(variants.international.startingRows).toBe(4);
    });

    it("Nigerian: should create 10x10 board with 20 pieces per player", () => {
      const board = createInitialBoard(variants.nigerian);
      expect(board.length).toBe(10);
      expect(variants.nigerian.piecesPerPlayer).toBe(20);
      expect(variants.nigerian.startingRows).toBe(4);
    });

    it("All variants: should use dark squares only", () => {
      expect(variants.american.darkSquaresUsed).toBe(true);
      expect(variants.international.darkSquaresUsed).toBe(true);
      expect(variants.nigerian.darkSquaresUsed).toBe(true);
    });

    it("American: should have dark bottom-left square", () => {
      expect(variants.american.bottomLeftSquareColor).toBe("dark");
    });

    it("International: should have light bottom-left square", () => {
      expect(variants.international.bottomLeftSquareColor).toBe("light");
    });

    it("Nigerian: should have light bottom-left square", () => {
      expect(variants.nigerian.bottomLeftSquareColor).toBe("light");
    });
  });
});
