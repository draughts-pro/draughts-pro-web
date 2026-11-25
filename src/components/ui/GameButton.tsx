import { cn } from "@/lib/utils";
import { soundManager } from "@/pages/game/utils/sounds";
import { preferencesAtom } from "@/pages/settings/utils/preferences";
import { useAtomValue } from "jotai";
import React from "react";

type Tone = "gold" | "green" | "blue" | "red" | "slate";
type Size = "lg" | "md" | "sm" | "icon";

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: Size;
}

/**
 * Chunky candy button: glossy face sitting on a coloured lip. On press the
 * face drops onto the lip (translateY = lip height) and plays a soft tick.
 */
const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ tone = "gold", size = "md", className, onClick, type = "button", children, ...rest }, ref) => {
    const prefs = useAtomValue(preferencesAtom);

    return (
      <button
        ref={ref}
        type={type}
        className={cn("btn", tone !== "gold" && `btn--${tone}`, `btn--${size}`, className)}
        onClick={(e) => {
          soundManager.setSoundEnabled(prefs.sound);
          soundManager.playTap();
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

GameButton.displayName = "GameButton";

export default GameButton;
