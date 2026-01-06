import type { Variant } from "../utils/variants";
import { variants } from "../utils/variants";

describe("Variants Configuration", () => {
  describe("Variant Structure", () => {
    it("should have all three variants defined", () => {
      expect(variants.american).toBeDefined();
      expect(variants.international).toBeDefined();
      expect(variants.nigerian).toBeDefined();
    });

    it("should have correct variant names", () => {
      expect(variants.american.name).toBe(
        "American Checkers (English Draughts)"
      );
      expect(variants.international.name).toBe(
        "International Checkers (Polish Draughts)"
      );
      expect(variants.nigerian.name).toBe("Nigerian Checkers (Drafts)");
    });
  });

  describe("Board Configuration", () => {
    describe("American Checkers", () => {
      it("should have 8x8 board", () => {
        expect(variants.american.boardSize).toBe(8);
      });

      it("should have 12 pieces per player", () => {
        expect(variants.american.piecesPerPlayer).toBe(12);
      });

      it("should have 3 starting rows", () => {
        expect(variants.american.startingRows).toBe(3);
      });

      it("should use dark squares", () => {
        expect(variants.american.darkSquaresUsed).toBe(true);
      });

      it("should have dark bottom-left square", () => {
        expect(variants.american.bottomLeftSquareColor).toBe("dark");
      });
    });

    describe("International Checkers", () => {
      it("should have 10x10 board", () => {
        expect(variants.international.boardSize).toBe(10);
      });

      it("should have 20 pieces per player", () => {
        expect(variants.international.piecesPerPlayer).toBe(20);
      });

      it("should have 4 starting rows", () => {
        expect(variants.international.startingRows).toBe(4);
      });

      it("should use dark squares", () => {
        expect(variants.international.darkSquaresUsed).toBe(true);
      });

      it("should have light bottom-left square", () => {
        expect(variants.international.bottomLeftSquareColor).toBe("light");
      });
    });

    describe("Nigerian Checkers", () => {
      it("should have 10x10 board", () => {
        expect(variants.nigerian.boardSize).toBe(10);
      });

      it("should have 20 pieces per player", () => {
        expect(variants.nigerian.piecesPerPlayer).toBe(20);
      });

      it("should have 4 starting rows", () => {
        expect(variants.nigerian.startingRows).toBe(4);
      });

      it("should use dark squares", () => {
        expect(variants.nigerian.darkSquaresUsed).toBe(true);
      });

      it("should have light bottom-left square", () => {
        expect(variants.nigerian.bottomLeftSquareColor).toBe("light");
      });
    });
  });

  describe("Movement Rules", () => {
    it("all variants should have men move forward only", () => {
      expect(variants.american.menMoveDirection).toBe("forward");
      expect(variants.international.menMoveDirection).toBe("forward");
      expect(variants.nigerian.menMoveDirection).toBe("forward");
    });

    it("all variants should allow men to capture in both directions", () => {
      expect(variants.american.menCaptureDirection).toBe("both");
      expect(variants.international.menCaptureDirection).toBe("both");
      expect(variants.nigerian.menCaptureDirection).toBe("both");
    });

    it("American kings should move only 1 square", () => {
      expect(variants.american.kingMoveDistance).toBe(1);
      expect(variants.american.kingCaptureDistance).toBe(1);
    });

    it("International kings should move unlimited distance", () => {
      expect(variants.international.kingMoveDistance).toBe("unlimited");
      expect(variants.international.kingCaptureDistance).toBe("unlimited");
    });

    it("Nigerian kings should move unlimited distance", () => {
      expect(variants.nigerian.kingMoveDistance).toBe("unlimited");
      expect(variants.nigerian.kingCaptureDistance).toBe("unlimited");
    });
  });

  describe("Capture Rules", () => {
    it("all variants should enforce forced capture", () => {
      expect(variants.american.forcedCapture).toBe(true);
      expect(variants.international.forcedCapture).toBe(true);
      expect(variants.nigerian.forcedCapture).toBe(true);
    });

    it("only International should require maximum capture", () => {
      expect(variants.american.mustCaptureMaximum).toBe(false);
      expect(variants.international.mustCaptureMaximum).toBe(true);
      expect(variants.nigerian.mustCaptureMaximum).toBe(false);
    });

    it("all variants should allow multiple captures", () => {
      expect(variants.american.canCaptureMultiple).toBe(true);
      expect(variants.international.canCaptureMultiple).toBe(true);
      expect(variants.nigerian.canCaptureMultiple).toBe(true);
    });

    it("American should remove captured pieces immediately", () => {
      expect(variants.american.capturedPiecesRemovedWhen).toBe("immediately");
    });

    it("International and Nigerian should remove captured pieces after sequence", () => {
      expect(variants.international.capturedPiecesRemovedWhen).toBe(
        "afterSequence"
      );
      expect(variants.nigerian.capturedPiecesRemovedWhen).toBe("afterSequence");
    });

    it("only International and Nigerian should allow passing over same square twice", () => {
      expect(variants.american.canPassOverSameSquareTwice).toBe(false);
      expect(variants.international.canPassOverSameSquareTwice).toBe(true);
      expect(variants.nigerian.canPassOverSameSquareTwice).toBe(true);
    });

    it("no variant should count kings more in captures", () => {
      expect(variants.american.captureCountsKingsMore).toBe(false);
      expect(variants.international.captureCountsKingsMore).toBe(false);
      expect(variants.nigerian.captureCountsKingsMore).toBe(false);
    });
  });

  describe("Promotion Rules", () => {
    it("all variants should promote at last row", () => {
      expect(variants.american.promotionRow).toBe("lastRow");
      expect(variants.international.promotionRow).toBe("lastRow");
      expect(variants.nigerian.promotionRow).toBe("lastRow");
    });

    it("only American should interrupt capture on promotion", () => {
      expect(variants.american.promotionInterruptsCapture).toBe(true);
      expect(variants.international.promotionInterruptsCapture).toBe(false);
      expect(variants.nigerian.promotionInterruptsCapture).toBe(false);
    });

    it("only American should promote to king mid-capture", () => {
      expect(variants.american.promotesToKingMidCapture).toBe(true);
      expect(variants.international.promotesToKingMidCapture).toBe(false);
      expect(variants.nigerian.promotesToKingMidCapture).toBe(false);
    });
  });

  describe("Win Conditions", () => {
    it("all variants should have captureAll win condition", () => {
      expect(variants.american.winConditions).toContain("captureAll");
      expect(variants.international.winConditions).toContain("captureAll");
      expect(variants.nigerian.winConditions).toContain("captureAll");
    });

    it("all variants should have blockAll win condition", () => {
      expect(variants.american.winConditions).toContain("blockAll");
      expect(variants.international.winConditions).toContain("blockAll");
      expect(variants.nigerian.winConditions).toContain("blockAll");
    });

    it("all variants should have exactly 2 win conditions", () => {
      expect(variants.american.winConditions).toHaveLength(2);
      expect(variants.international.winConditions).toHaveLength(2);
      expect(variants.nigerian.winConditions).toHaveLength(2);
    });
  });

  describe("Draw Conditions", () => {
    it("all variants should support draw by agreement", () => {
      expect(variants.american.drawConditions).toContain("agreement");
      expect(variants.international.drawConditions).toContain("agreement");
      expect(variants.nigerian.drawConditions).toContain("agreement");
    });

    it("all variants should support draw by no legal moves", () => {
      expect(variants.american.drawConditions).toContain("noLegalMoves");
      expect(variants.international.drawConditions).toContain("noLegalMoves");
      expect(variants.nigerian.drawConditions).toContain("noLegalMoves");
    });

    it("American and International should support repetition draws", () => {
      expect(variants.american.drawConditions).toContain("repetition");
      expect(variants.international.drawConditions).toContain("repetition");
      expect(variants.nigerian.drawConditions).not.toContain("repetition");
    });

    it("only Nigerian should support insufficient material draws", () => {
      expect(variants.american.drawConditions).not.toContain(
        "insufficientMaterial"
      );
      expect(variants.international.drawConditions).not.toContain(
        "insufficientMaterial"
      );
      expect(variants.nigerian.drawConditions).toContain(
        "insufficientMaterial"
      );
    });

    it("American should have 40-move rule", () => {
      expect(variants.american.drawConditions).toContain("40MoveRule");
    });

    it("International should have 25-move rule", () => {
      expect(variants.international.drawConditions).toContain("25MoveRule");
    });

    it("Nigerian should not have move-count rules", () => {
      expect(variants.nigerian.drawConditions).not.toContain("25MoveRule");
      expect(variants.nigerian.drawConditions).not.toContain("40MoveRule");
      expect(variants.nigerian.drawConditions).not.toContain("50MoveRule");
    });
  });

  describe("Variant Consistency", () => {
    const variantKeys = Object.keys(variants) as Array<keyof typeof variants>;

    it("each variant should have all required properties", () => {
      const requiredProps: Array<keyof Variant> = [
        "name",
        "boardSize",
        "piecesPerPlayer",
        "startingRows",
        "menMoveDirection",
        "menCaptureDirection",
        "kingMoveDistance",
        "kingCaptureDistance",
        "forcedCapture",
        "mustCaptureMaximum",
        "captureCountsKingsMore",
        "canCaptureMultiple",
        "capturedPiecesRemovedWhen",
        "canPassOverSameSquareTwice",
        "promotionRow",
        "promotionInterruptsCapture",
        "promotesToKingMidCapture",
        "winConditions",
        "drawConditions",
        "darkSquaresUsed",
        "bottomLeftSquareColor",
      ];

      variantKeys.forEach((key) => {
        const variant = variants[key];
        requiredProps.forEach((prop) => {
          expect(variant).toHaveProperty(prop);
        });
      });
    });

    it("board size should match valid values", () => {
      variantKeys.forEach((key) => {
        const boardSize = variants[key].boardSize;
        expect([8, 10, 12]).toContain(boardSize);
      });
    });

    it("pieces per player should be reasonable", () => {
      variantKeys.forEach((key) => {
        const pieces = variants[key].piecesPerPlayer;
        expect(pieces).toBeGreaterThan(0);
        expect(pieces).toBeLessThan(100);
      });
    });

    it("starting rows should not exceed half the board", () => {
      variantKeys.forEach((key) => {
        const variant = variants[key];
        expect(variant.startingRows).toBeLessThan(variant.boardSize / 2);
      });
    });
  });

  describe("Type Safety", () => {
    it("should be a const object", () => {
      // Verify that variants is properly typed as const
      expect(variants).toBeDefined();
      expect(typeof variants).toBe("object");
    });

    it("boardSize should only accept valid values", () => {
      const validSizes: Array<8 | 10 | 12> = [8, 10, 12];
      const allKeys = Object.keys(variants) as Array<keyof typeof variants>;
      allKeys.forEach((key) => {
        expect(validSizes).toContain(variants[key].boardSize);
      });
    });

    it("bottomLeftSquareColor should only be light or dark", () => {
      const validColors: Array<"light" | "dark"> = ["light", "dark"];
      const allKeys = Object.keys(variants) as Array<keyof typeof variants>;
      allKeys.forEach((key) => {
        expect(validColors).toContain(variants[key].bottomLeftSquareColor);
      });
    });
  });
});
