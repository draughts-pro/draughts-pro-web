import { AI_SETTINGS, PIECE_VALUES } from "../utils/constants";

describe("Constants", () => {
  it("should have correct AI depth settings", () => {
    expect(AI_SETTINGS.DEPTH.EASY).toBe(1);
    expect(AI_SETTINGS.DEPTH.MEDIUM).toBe(3);
    expect(AI_SETTINGS.DEPTH.HARD).toBe(5);
    expect(AI_SETTINGS.DEPTH.MASTER).toBe(7);
  });

  it("should have correct piece values", () => {
    expect(PIECE_VALUES.REGULAR).toBe(1);
    expect(PIECE_VALUES.KING).toBe(3);
  });

  it("should have top moves count", () => {
    expect(AI_SETTINGS.TOP_MOVES_COUNT).toBe(3);
  });
});
