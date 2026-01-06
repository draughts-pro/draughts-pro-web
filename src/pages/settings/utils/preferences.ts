import { atomWithStorage } from "jotai/utils";
import type { variants } from "./variants";

export type Difficulty = 1 | 2 | 3 | 4;

type Preferences = {
  variant: keyof typeof variants;
  sound: boolean;
  difficulty: Difficulty;
};

export const preferencesAtom = atomWithStorage<Preferences>(
  "pages.settings.preferences",
  {
    variant: "international",
    sound: true,
    difficulty: 2,
  }
);
