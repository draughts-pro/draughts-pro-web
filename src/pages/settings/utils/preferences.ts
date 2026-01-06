import { atomWithStorage } from "jotai/utils";
import type { variants } from "./variants";

type Preferences = {
  variant: keyof typeof variants;
  sound: boolean;
  difficulty: 1 | 2 | 3;
};

export const preferencesAtom = atomWithStorage<Preferences>(
  "pages.settings.preferences",
  {
    variant: "international",
    sound: true,
    difficulty: 2,
  }
);
