import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../../components/Board";
import GlassCard from "../../components/GlassCard";
import { preferencesAtom } from "../settings/preferences";
import {
  executeAIMoveActionAtom,
  forfeitActionAtom,
  getHintActionAtom,
  newGameActionAtom,
} from "./actions";
import GameOverModal from "./game-over-modal";
import PlayerInfo from "./player-info";
import {
  capturedPiecesAtom,
  currentTurnAtom,
  gameModeAtom,
  isAiThinkingAtom,
} from "./state";

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentTurn = useAtomValue(currentTurnAtom);
  const capturedPieces = useAtomValue(capturedPiecesAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const isAiThinking = useAtomValue(isAiThinkingAtom);
  const forfeit = useSetAtom(forfeitActionAtom);
  const getHint = useSetAtom(getHintActionAtom);
  const executeAIMove = useSetAtom(executeAIMoveActionAtom);
  const newGame = useSetAtom(newGameActionAtom);
  const t = useAtomValue(translationsAtom);
  const preferences = useAtomValue(preferencesAtom);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (gameMode === "ai" && currentTurn === "dark" && !isAiThinking) {
      executeAIMove();
    }
  }, [currentTurn, gameMode, isAiThinking, executeAIMove]);

  const difficultyLabels = {
    1: t.settings.easy,
    2: t.settings.medium,
    3: t.settings.hard,
  };
  const aiLabel = `${t.game.ai} (${difficultyLabels[preferences.difficulty]})`;

  return (
    <div className="flex flex-col min-h-dvh bg-primary">
      <GameOverModal />
      <div className="lg:hidden p-4">
        <PlayerInfo
          name={aiLabel}
          isTurn={currentTurn === "dark"}
          capturedCount={capturedPieces.light}
          pieceColor="dark"
          isComputer={true}
          isThinking={isAiThinking}
        />
      </div>
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-80 lg:flex-col p-6 space-y-4">
          <GlassCard>
            <div className="w-full p-4 space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition"
              >
                <Icon icon="mdi:arrow-left" className="text-xl" />
                <span>{t.game.backToMenu}</span>
              </button>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  {t.game.gameMode}
                </div>
                <div className="text-white font-semibold">
                  {t.variants[preferences.variant]}
                </div>
              </div>
            </div>
          </GlassCard>
          <PlayerInfo
            name={aiLabel}
            isTurn={currentTurn === "dark"}
            capturedCount={capturedPieces.light}
            pieceColor="dark"
            isComputer={true}
            isThinking={isAiThinking}
          />
        </div>
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ maxWidth: "90dvh", maxHeight: "90dvh" }}
          >
            <Board />
          </div>
        </div>
        <div className="hidden lg:flex lg:w-80 lg:flex-col p-6 space-y-4">
          <PlayerInfo
            name={t.game.you}
            isTurn={currentTurn === "light"}
            capturedCount={capturedPieces.dark}
            pieceColor="light"
          />
          <div className="flex-1 flex flex-col justify-end space-y-3">
            <button
              onClick={() => getHint()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
            >
              <Icon icon="mdi:lightbulb-outline" className="text-xl" />
              <span>{t.game.hint}</span>
            </button>
            <button
              onClick={() => forfeit()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition"
            >
              <Icon icon="mdi:flag" className="text-xl" />
              <span>{t.game.forfeit}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="lg:hidden p-4 space-y-4">
        <PlayerInfo
          name={t.game.you}
          isTurn={currentTurn === "light"}
          capturedCount={capturedPieces.dark}
          pieceColor="light"
        />
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
          >
            <Icon icon="mdi:arrow-left" className="text-lg" />
          </button>
          <button
            onClick={() => getHint()}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition text-sm"
          >
            <Icon icon="mdi:lightbulb-outline" className="text-lg" />
            <span>{t.game.hint}</span>
          </button>
          <button
            onClick={() => forfeit()}
            className="flex items-center justify-center px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition"
          >
            <Icon icon="mdi:flag" className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
