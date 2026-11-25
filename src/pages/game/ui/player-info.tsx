import { MiniPiece } from "@/components/Piece";
import { Icon, PlayerFace, RobotFace } from "@/components/ui/icons";
import { translationsAtom } from "@/i18n";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import React from "react";

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/** Game HUD card: avatar, name, turn badge, captured tally and turn clock. */
const PlayerInfo: React.FC<{
  name: string;
  isTurn: boolean;
  capturedCount: number;
  pieceColor: "light" | "dark";
  isComputer?: boolean;
  isThinking?: boolean;
  isRival?: boolean;
  clockSeconds?: number;
  className?: string;
}> = ({
  name,
  isTurn,
  capturedCount,
  pieceColor,
  isComputer = false,
  isThinking = false,
  isRival = false,
  clockSeconds,
  className,
}) => {
  const t = useAtomValue(translationsAtom);
  const opponentColor = pieceColor === "light" ? "dark" : "light";
  const thinking = isThinking && isTurn;

  return (
    <section
      className={clsx(
        "hud-panel flex items-center gap-3 p-2.5 pr-3 transition-shadow duration-300",
        isTurn && "turn-glow",
        className
      )}
      aria-label={name}
    >
      <div className={clsx("avatar", isComputer && "avatar--ai", isRival && "avatar--rival")}>
        {isComputer ? <RobotFace className="w-9 h-9" /> : <PlayerFace className="w-9 h-9" />}
        <MiniPiece color={pieceColor} size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate text-[1.05rem] font-black leading-tight">{name}</h3>
        </div>
        <div className="mt-1 h-6 flex items-center gap-2">
          {thinking ? (
            <span className="turn-badge" aria-live="polite">
              <span className="sr-only">{t.game.thinking}</span>
              <span aria-hidden className="inline-flex gap-1">
                <span className="thinking-dot" />
                <span className="thinking-dot" style={{ "--i": 1 } as React.CSSProperties} />
                <span className="thinking-dot" style={{ "--i": 2 } as React.CSSProperties} />
              </span>
            </span>
          ) : isTurn ? (
            <span className="turn-badge">{t.game.currentTurn}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div
          className="flex items-center gap-1.5"
          aria-label={`${t.game.captured}: ${capturedCount}`}
          title={t.game.captured}
        >
          <MiniPiece color={opponentColor} size={20} />
          <span key={capturedCount} className="num text-lg font-black leading-none pop-in" aria-hidden>
            ×{capturedCount}
          </span>
        </div>
        {clockSeconds !== undefined && (
          <span className="clock text-sm" data-active={isTurn || undefined}>
            <Icon name="clock" className="w-3.5 h-3.5" />
            {formatClock(clockSeconds)}
          </span>
        )}
      </div>
    </section>
  );
};

export default PlayerInfo;
