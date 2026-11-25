import { translationsAtom } from "@/i18n";
import { preferencesAtom } from "@/pages/settings/utils/preferences";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import GameButton from "./GameButton";
import { Icon } from "./icons";

/** Round mute / unmute button for the title screen and the game HUD. */
const SoundToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [prefs, setPrefs] = useAtom(preferencesAtom);
  const t = useAtomValue(translationsAtom);

  return (
    <GameButton
      tone="slate"
      size="icon"
      className={className}
      aria-label={t.settings.sound}
      aria-pressed={prefs.sound}
      onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
    >
      <Icon name={prefs.sound ? "sound" : "mute"} className="w-6 h-6 relative" />
    </GameButton>
  );
};

export default SoundToggle;
