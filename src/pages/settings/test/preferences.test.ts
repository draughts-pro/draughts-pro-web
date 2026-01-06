import { createStore } from "jotai";
import { preferencesAtom } from "../utils/preferences";
import { variants } from "../utils/variants";

describe("Preferences", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    // Create a fresh store for each test
    store = createStore();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("Default Values", () => {
    it("should have international as default variant", () => {
      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("international");
    });

    it("should have sound enabled by default", () => {
      const prefs = store.get(preferencesAtom);
      expect(prefs.sound).toBe(true);
    });

    it("should have medium difficulty by default", () => {
      const prefs = store.get(preferencesAtom);
      expect(prefs.difficulty).toBe(2);
    });

    it("should have all required properties", () => {
      const prefs = store.get(preferencesAtom);
      expect(prefs).toHaveProperty("variant");
      expect(prefs).toHaveProperty("sound");
      expect(prefs).toHaveProperty("difficulty");
    });
  });

  describe("Variant Preference", () => {
    it("should allow setting American variant", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, variant: "american" }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("american");
    });

    it("should allow setting International variant", () => {
      store.set(preferencesAtom, (prev) => ({
        ...prev,
        variant: "international",
      }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("international");
    });

    it("should allow setting Nigerian variant", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, variant: "nigerian" }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("nigerian");
    });

    it("variant should be a valid key in variants object", () => {
      const prefs = store.get(preferencesAtom);
      expect(variants[prefs.variant]).toBeDefined();
    });

    it("should preserve other preferences when changing variant", () => {
      store.set(preferencesAtom, {
        variant: "american",
        sound: false,
        difficulty: 3,
      });

      store.set(preferencesAtom, (prev) => ({ ...prev, variant: "nigerian" }));
      const prefs = store.get(preferencesAtom);

      expect(prefs.variant).toBe("nigerian");
      expect(prefs.sound).toBe(false);
      expect(prefs.difficulty).toBe(3);
    });
  });

  describe("Sound Preference", () => {
    it("should allow enabling sound", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, sound: true }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.sound).toBe(true);
    });

    it("should allow disabling sound", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, sound: false }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.sound).toBe(false);
    });

    it("should toggle sound preference", () => {
      const initialSound = store.get(preferencesAtom).sound;
      store.set(preferencesAtom, (prev) => ({ ...prev, sound: !prev.sound }));
      const newSound = store.get(preferencesAtom).sound;
      expect(newSound).toBe(!initialSound);
    });

    it("should preserve other preferences when changing sound", () => {
      store.set(preferencesAtom, {
        variant: "nigerian",
        sound: true,
        difficulty: 1,
      });

      store.set(preferencesAtom, (prev) => ({ ...prev, sound: false }));
      const prefs = store.get(preferencesAtom);

      expect(prefs.variant).toBe("nigerian");
      expect(prefs.sound).toBe(false);
      expect(prefs.difficulty).toBe(1);
    });
  });

  describe("Difficulty Preference", () => {
    it("should allow setting easy difficulty (1)", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, difficulty: 1 }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.difficulty).toBe(1);
    });

    it("should allow setting medium difficulty (2)", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, difficulty: 2 }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.difficulty).toBe(2);
    });

    it("should allow setting hard difficulty (3)", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, difficulty: 3 }));
      const prefs = store.get(preferencesAtom);
      expect(prefs.difficulty).toBe(3);
    });

    it("difficulty should be between 1 and 3", () => {
      const prefs = store.get(preferencesAtom);
      expect(prefs.difficulty).toBeGreaterThanOrEqual(1);
      expect(prefs.difficulty).toBeLessThanOrEqual(3);
    });

    it("should preserve other preferences when changing difficulty", () => {
      store.set(preferencesAtom, {
        variant: "american",
        sound: false,
        difficulty: 1,
      });

      store.set(preferencesAtom, (prev) => ({ ...prev, difficulty: 3 }));
      const prefs = store.get(preferencesAtom);

      expect(prefs.variant).toBe("american");
      expect(prefs.sound).toBe(false);
      expect(prefs.difficulty).toBe(3);
    });
  });

  describe("LocalStorage Persistence", () => {
    it("should persist preferences to localStorage", () => {
      store.set(preferencesAtom, {
        variant: "american",
        sound: false,
        difficulty: 3,
      });

      const stored = localStorage.getItem("pages.settings.preferences");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.variant).toBe("american");
      expect(parsed.sound).toBe(false);
      expect(parsed.difficulty).toBe(3);
    });

    it("should sync preferences with localStorage key", () => {
      // Verify that preferences are stored under the correct localStorage key
      store.set(preferencesAtom, {
        variant: "nigerian",
        sound: false,
        difficulty: 1,
      });

      const stored = localStorage.getItem("pages.settings.preferences");
      expect(stored).toBeDefined();

      // Verify the structure matches expectations
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty("variant");
      expect(parsed).toHaveProperty("sound");
      expect(parsed).toHaveProperty("difficulty");
      expect(parsed.variant).toBe("nigerian");
    });

    it("should use defaults if localStorage is empty", () => {
      localStorage.clear();

      const newStore = createStore();
      const prefs = newStore.get(preferencesAtom);

      expect(prefs.variant).toBe("international");
      expect(prefs.sound).toBe(true);
      expect(prefs.difficulty).toBe(2);
    });

    it("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem("pages.settings.preferences", "invalid json");

      const newStore = createStore();
      const prefs = newStore.get(preferencesAtom);

      // Should fall back to defaults
      expect(prefs.variant).toBe("international");
      expect(prefs.sound).toBe(true);
      expect(prefs.difficulty).toBe(2);
    });

    it("should update localStorage when preferences change", () => {
      store.set(preferencesAtom, {
        variant: "american",
        sound: true,
        difficulty: 1,
      });

      const stored1 = localStorage.getItem("pages.settings.preferences");
      const parsed1 = JSON.parse(stored1!);
      expect(parsed1.variant).toBe("american");

      store.set(preferencesAtom, (prev) => ({ ...prev, variant: "nigerian" }));

      const stored2 = localStorage.getItem("pages.settings.preferences");
      const parsed2 = JSON.parse(stored2!);
      expect(parsed2.variant).toBe("nigerian");
    });
  });

  describe("Multiple Preference Updates", () => {
    it("should handle multiple sequential updates", () => {
      store.set(preferencesAtom, (prev) => ({ ...prev, variant: "american" }));
      store.set(preferencesAtom, (prev) => ({ ...prev, sound: false }));
      store.set(preferencesAtom, (prev) => ({ ...prev, difficulty: 3 }));

      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("american");
      expect(prefs.sound).toBe(false);
      expect(prefs.difficulty).toBe(3);
    });

    it("should handle bulk update of all preferences", () => {
      store.set(preferencesAtom, {
        variant: "nigerian",
        sound: false,
        difficulty: 1,
      });

      const prefs = store.get(preferencesAtom);
      expect(prefs.variant).toBe("nigerian");
      expect(prefs.sound).toBe(false);
      expect(prefs.difficulty).toBe(1);
    });

    it("should maintain consistency across updates", () => {
      const updates = [
        { variant: "american" as const, sound: true, difficulty: 1 as const },
        {
          variant: "international" as const,
          sound: false,
          difficulty: 2 as const,
        },
        { variant: "nigerian" as const, sound: true, difficulty: 3 as const },
      ];

      updates.forEach((update) => {
        store.set(preferencesAtom, update);
        const prefs = store.get(preferencesAtom);
        expect(prefs).toEqual(update);
      });
    });
  });

  describe("Type Safety", () => {
    it("variant should only accept valid variant keys", () => {
      const validVariants: Array<keyof typeof variants> = [
        "american",
        "international",
        "nigerian",
      ];
      const prefs = store.get(preferencesAtom);
      expect(validVariants).toContain(prefs.variant);
    });

    it("difficulty should only be 1, 2, or 3", () => {
      const validDifficulties: Array<1 | 2 | 3> = [1, 2, 3];
      const prefs = store.get(preferencesAtom);
      expect(validDifficulties).toContain(prefs.difficulty);
    });

    it("sound should be a boolean", () => {
      const prefs = store.get(preferencesAtom);
      expect(typeof prefs.sound).toBe("boolean");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid successive updates", () => {
      for (let i = 0; i < 100; i++) {
        const difficulty = ((i % 3) + 1) as 1 | 2 | 3;
        store.set(preferencesAtom, (prev) => ({ ...prev, difficulty }));
      }

      const prefs = store.get(preferencesAtom);
      expect([1, 2, 3]).toContain(prefs.difficulty);
    });

    it("should handle undefined fields gracefully", () => {
      localStorage.setItem(
        "pages.settings.preferences",
        JSON.stringify({ variant: "american" })
      );

      const newStore = createStore();
      const prefs = newStore.get(preferencesAtom);

      expect(prefs).toHaveProperty("variant");
      expect(prefs).toHaveProperty("sound");
      expect(prefs).toHaveProperty("difficulty");
    });
  });
});
