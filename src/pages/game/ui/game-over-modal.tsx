import { MiniPiece } from "@/components/Piece";
import GameButton from "@/components/ui/GameButton";
import { Crown, Icon } from "@/components/ui/icons";
import Modal from "@/components/ui/Modal";
import { translationsAtom } from "@/i18n";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { newGameActionAtom } from "../utils/actions";
import { multiplayerGameStateAtom } from "../utils/multiplayer-state";
import { gameEndReasonAtom, gameStatusAtom, winnerAtom } from "../utils/state";

const CONFETTI_COLORS = [
  "oklch(0.84 0.16 84)",
  "oklch(0.74 0.19 145)",
  "oklch(0.66 0.15 243)",
  "oklch(0.63 0.21 27)",
  "oklch(0.97 0.02 90)",
];

const Confetti: React.FC = () => {
  // Deterministic spread so the burst looks the same on every render.
  const bits = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
        return {
          x: `${r(1) * 100}%`,
          d: `${2.2 + r(2) * 1.8}s`,
          delay: `${r(3) * 0.6}s`,
          drift: `${(r(4) - 0.5) * 160}px`,
          spin: `${(r(5) - 0.5) * 1440}deg`,
          c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        };
      }),
    []
  );
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <i
          key={i}
          style={
            {
              "--x": b.x,
              "--d": b.d,
              "--delay": b.delay,
              "--drift": b.drift,
              "--spin": b.spin,
              "--c": b.c,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

const GameOverModal: React.FC = () => {
  const gameStatus = useAtomValue(gameStatusAtom);
  const winner = useAtomValue(winnerAtom);
  const gameEndReason = useAtomValue(gameEndReasonAtom);
  const newGame = useSetAtom(newGameActionAtom);
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);
  const multiplayerState = useAtomValue(multiplayerGameStateAtom);
  const isMultiplayer = multiplayerState.isMultiplayer;

  if (gameStatus === "playing") return null;

  const isWon = gameStatus === "won";
  const isLost = gameStatus === "lost";

  let title = "";
  if (isWon) title = t.gameOver.youWon;
  else if (isLost) title = t.gameOver.youLost;
  else title = t.gameOver.draw;

  let message = "";
  if (gameEndReason === "forfeit") {
    if (isMultiplayer) {
      message = gameStatus === "won" ? t.gameOver.opponentForfeited : t.gameOver.youForfeited;
    } else {
      message = t.gameOver.youForfeited;
    }
  } else if (gameEndReason === "capture") {
    if (isMultiplayer) {
      message = gameStatus === "won" ? t.gameOver.youCapturedAll : t.gameOver.opponentCapturedAll;
    } else {
      message = winner === "light" ? t.gameOver.youCapturedAll : t.gameOver.aiCapturedAll;
    }
  } else if (gameEndReason === "noMoves") {
    if (isMultiplayer) {
      message = gameStatus === "won" ? t.gameOver.opponentHasNoMoves : t.gameOver.youHaveNoMoves;
    } else {
      message = winner === "light" ? t.gameOver.aiHasNoMoves : t.gameOver.youHaveNoMoves;
    }
  } else if (gameEndReason === "disconnect") {
    if (isMultiplayer) {
      message = gameStatus === "won" ? t.gameOver.opponentDisconnected : t.gameOver.youDisconnected;
    } else {
      message = t.gameOver.opponentDisconnected;
    }
  }

  const myColor = isMultiplayer ? multiplayerState.playerColor ?? "light" : "light";
  const theirColor = myColor === "light" ? "dark" : "light";

  return (
    <>
      {isWon && <Confetti />}
      <Modal
        ribbon={title}
        ribbonTone={isWon ? "green" : isLost ? "red" : "blue"}
        cardClassName={isLost ? "shake" : undefined}
        backdrop={isWon ? <div className="rays" aria-hidden /> : undefined}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative h-28 w-44 mb-3" aria-hidden>
            {isWon ? (
              <div className="trophy-bob absolute inset-0 flex flex-col items-center justify-end">
                <Crown className="w-20 h-14 text-[var(--gold)] -mb-3 relative z-10 drop-shadow-md" />
                <MiniPiece color={myColor} isKing size={88} />
              </div>
            ) : isLost ? (
              <div className="absolute inset-0 flex items-end justify-center gap-1">
                <span className="rotate-[-14deg] translate-y-2 opacity-90">
                  <MiniPiece color={myColor} size={58} />
                </span>
                <MiniPiece color={theirColor} isKing size={84} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end justify-center -space-x-3">
                <MiniPiece color="light" size={76} />
                <MiniPiece color="dark" size={76} />
              </div>
            )}
          </div>
          {message && <p className="text-lg font-extrabold text-card-text-muted mb-6 text-balance">{message}</p>}
        </div>

        <div className="flex flex-col gap-4">
          {!isMultiplayer && (
            <GameButton tone="green" size="lg" className="w-full" onClick={() => newGame()}>
              <Icon name="refresh" className="w-6 h-6 relative" />
              <span className="relative">{t.gameOver.newGame}</span>
            </GameButton>
          )}
          <GameButton tone={isMultiplayer ? "blue" : "slate"} size="md" className="w-full" onClick={() => navigate("/")}>
            <Icon name="home" className="w-5 h-5 relative" />
            <span className="relative">{t.gameOver.backToMenu}</span>
          </GameButton>
        </div>
      </Modal>
    </>
  );
};

export default GameOverModal;
