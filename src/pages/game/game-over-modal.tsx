import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/GlassCard";
import { newGameActionAtom } from "./actions";
import { gameEndReasonAtom, gameStatusAtom, winnerAtom } from "./state";

const GameOverModal: React.FC = () => {
  const gameStatus = useAtomValue(gameStatusAtom);
  const winner = useAtomValue(winnerAtom);
  const gameEndReason = useAtomValue(gameEndReasonAtom);
  const newGame = useSetAtom(newGameActionAtom);
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);

  if (gameStatus === "playing") return null;

  const isWon = gameStatus === "won";
  const isLost = gameStatus === "lost";
  const isDraw = gameStatus === "draw";

  let title = "";
  let icon = "";
  let iconClass = "";

  if (isWon) {
    title = t.gameOver.youWon;
    icon = "mdi:trophy";
    iconClass = "text-yellow-400";
  } else if (isLost) {
    title = t.gameOver.youLost;
    icon = "mdi:emoticon-sad-outline";
    iconClass = "text-red-400";
  } else if (isDraw) {
    title = t.gameOver.draw;
    icon = "mdi:handshake";
    iconClass = "text-blue-400";
  }

  let message = "";
  if (gameEndReason === "forfeit") {
    message = t.gameOver.youForfeited;
  } else if (gameEndReason === "capture") {
    message = winner === "light" ? t.gameOver.youCapturedAll : t.gameOver.aiCapturedAll;
  } else if (gameEndReason === "noMoves") {
    message = winner === "light" ? t.gameOver.aiHasNoMoves : t.gameOver.youHaveNoMoves;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        <GlassCard>
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Icon icon={icon} className={`text-6xl ${iconClass}`} />
              <h2 className="text-3xl font-bold text-white">{title}</h2>
              {message && (
                <p className="text-gray-300 text-center">
                  {message}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => newGame()}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-accent-green hover:bg-accent-green/80 text-white font-semibold rounded-xl transition"
              >
                <Icon icon="mdi:refresh" className="text-xl" />
                <span>{t.gameOver.newGame}</span>
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
              >
                <Icon icon="mdi:arrow-left" className="text-xl" />
                <span>{t.gameOver.backToMenu}</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default GameOverModal;
