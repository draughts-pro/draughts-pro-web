import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../../components/Board";
import GlassCard from "../../components/GlassCard";
import { preferencesAtom } from "../settings/utils/preferences";
import ConfirmationModal from "./ui/confirmation-modal";
import GameOverModal from "./ui/game-over-modal";
import PlayerInfo from "./ui/player-info";
import {
  executeAIMoveActionAtom,
  forfeitActionAtom,
  getHintActionAtom,
  newGameActionAtom,
} from "./utils/actions";
import {
  capturedPiecesAtom,
  currentTurnAtom,
  gameModeAtom,
  isAiThinkingAtom,
} from "./utils/state";

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

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: "backToMenu" | "forfeit" | null;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (gameMode === "ai" && currentTurn === "dark" && !isAiThinking) {
      executeAIMove();
    }
  }, [currentTurn, gameMode, isAiThinking, executeAIMove]);

  const handleBackToMenu = () => {
    setConfirmModalState({ isOpen: true, type: "backToMenu" });
  };

  const handleForfeit = () => {
    setConfirmModalState({ isOpen: true, type: "forfeit" });
  };

  const handleConfirm = () => {
    if (confirmModalState.type === "backToMenu") {
      navigate("/");
    } else if (confirmModalState.type === "forfeit") {
      forfeit();
    }
    setConfirmModalState({ isOpen: false, type: null });
  };

  const handleCancel = () => {
    setConfirmModalState({ isOpen: false, type: null });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "h":
          e.preventDefault();
          getHint();
          break;
        case "f":
          e.preventDefault();
          handleForfeit();
          break;
        case "escape":
          e.preventDefault();
          handleBackToMenu();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [getHint, handleForfeit, handleBackToMenu]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const difficultyLabels = {
    1: t.settings.easy,
    2: t.settings.medium,
    3: t.settings.hard,
    4: t.settings.master,
  };
  const aiLabel = `${t.game.ai} (${difficultyLabels[preferences.difficulty]})`;

  return (
    <div className="flex flex-col min-h-dvh bg-primary">
      <GameOverModal />
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        title={
          confirmModalState.type === "backToMenu"
            ? t.game.confirmBackToMenu
            : t.game.confirmForfeit
        }
        message={
          confirmModalState.type === "backToMenu"
            ? t.game.confirmBackToMenuMessage
            : t.game.confirmForfeitMessage
        }
        confirmText={t.game.confirm}
        cancelText={t.game.cancel}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDangerous={true}
      />
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
                onClick={handleBackToMenu}
                className="w-full flex items-center justify-between px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition group"
              >
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:arrow-left" className="text-xl" />
                  <span>{t.game.backToMenu}</span>
                </div>
                <kbd className="hidden md:inline-block px-2 py-1 text-xs font-mono bg-white/10 rounded border border-white/20 group-hover:bg-white/20 transition">
                  ESC
                </kbd>
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
          <div className="w-full h-full flex items-center justify-center max-w-[90dvh] max-h-[90dvh] md:max-w-[min(90dvh,90dvw)] md:max-h-[min(90dvh,90dvw)]">
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
              className="w-full flex items-center justify-between py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition group"
            >
              <div className="flex items-center space-x-2">
                <Icon icon="mdi:lightbulb-outline" className="text-xl" />
                <span>{t.game.hint}</span>
              </div>
              <kbd className="hidden md:inline-block px-2 py-1 text-xs font-mono bg-white/10 rounded border border-white/20 group-hover:bg-white/20 transition">
                H
              </kbd>
            </button>
            <button
              onClick={handleForfeit}
              className="w-full flex items-center justify-between py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition group"
            >
              <div className="flex items-center space-x-2">
                <Icon icon="mdi:flag" className="text-xl" />
                <span>{t.game.forfeit}</span>
              </div>
              <kbd className="hidden md:inline-block px-2 py-1 text-xs font-mono bg-white/10 rounded border border-white/20 group-hover:bg-white/20 transition">
                F
              </kbd>
            </button>
            <div className="hidden md:block pt-2">
              <div className="text-xs text-gray-400 text-center">
                <Icon icon="mdi:keyboard" className="inline text-sm mr-1" />
                Keyboard shortcuts available
              </div>
            </div>
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
            onClick={handleBackToMenu}
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
            onClick={handleForfeit}
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
