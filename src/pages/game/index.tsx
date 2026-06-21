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
import { multiplayerGameStateAtom } from "./utils/multiplayer-state";
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
  const multiplayerState = useAtomValue(multiplayerGameStateAtom);
  const isMultiplayer = multiplayerState.isMultiplayer;

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: "backToMenu" | "forfeit" | null;
  }>({ isOpen: false, type: null });

  useEffect(() => {
    if (!isMultiplayer) {
      newGame();
    }
  }, [newGame, isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer && gameMode === "ai" && currentTurn === "dark" && !isAiThinking) {
      executeAIMove();
    }
  }, [currentTurn, gameMode, isAiThinking, executeAIMove, isMultiplayer]);

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

  const bottomPlayerName = isMultiplayer
    ? multiplayerState.room?.players.find(p => p.id === multiplayerState.playerId)?.name || t.game.you
    : t.game.you;

  const topPlayerName = isMultiplayer
    ? multiplayerState.opponentName || "Opponent"
    : aiLabel;

  const bottomPlayerColor = isMultiplayer ? (multiplayerState.playerColor || "light") : "light";
  const topPlayerColor = bottomPlayerColor === "light" ? "dark" : "light";

  const bottomCapturedCount = capturedPieces[topPlayerColor as "light" | "dark"];
  const topCapturedCount = capturedPieces[bottomPlayerColor as "light" | "dark"];

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
      <div className="xl:hidden p-4">
        <PlayerInfo
          name={topPlayerName}
          isTurn={currentTurn === topPlayerColor}
          capturedCount={topCapturedCount}
          pieceColor={topPlayerColor}
          isComputer={!isMultiplayer}
          isThinking={isAiThinking}
        />
      </div>
      <div className="flex-1 flex flex-col xl:flex-row">
        <div className="hidden xl:flex xl:w-80 xl:flex-col p-6 space-y-4 overflow-y-auto">
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
            name={topPlayerName}
            isTurn={currentTurn === topPlayerColor}
            capturedCount={topCapturedCount}
            pieceColor={topPlayerColor}
            isComputer={!isMultiplayer}
            isThinking={isAiThinking}
          />

          {/* Combined Controls for Tablet/Small Laptop View */}
          <div className="2xl:hidden space-y-4">
            <PlayerInfo
              name={bottomPlayerName}
              isTurn={currentTurn === bottomPlayerColor}
              capturedCount={bottomCapturedCount}
              pieceColor={bottomPlayerColor}
            />
            <div className="space-y-3">
              {!isMultiplayer && (
                <button
                  onClick={() => getHint()}
                  className="w-full flex items-center justify-between py-3 px-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition group"
                >
                  <div className="flex items-center space-x-2">
                    <Icon icon="mdi:lightbulb-outline" className="text-xl" />
                    <span>{t.game.hint}</span>
                  </div>
                </button>
              )}
              <button
                onClick={handleForfeit}
                className="w-full flex items-center justify-between py-3 px-4 bg-red-600/80 hover:bg-red-600 text-white font-semibold rounded-xl transition group"
              >
                <div className="flex items-center space-x-2">
                  <Icon icon="mdi:flag" className="text-xl" />
                  <span>{t.game.forfeit}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 xl:p-8">
          <div className="w-full h-full flex items-center justify-center max-w-[90dvh] max-h-[90dvh] md:max-w-[min(90dvh,90dvw)] md:max-h-[min(90dvh,90dvw)]">
            <Board />
          </div>
        </div>
        <div className="hidden 2xl:flex 2xl:w-80 2xl:flex-col p-6 space-y-4">
          <PlayerInfo
            name={bottomPlayerName}
            isTurn={currentTurn === bottomPlayerColor}
            capturedCount={bottomCapturedCount}
            pieceColor={bottomPlayerColor}
          />
          <div className="flex-1 flex flex-col justify-end space-y-3">
            {!isMultiplayer && (
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
            )}
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
      <div className="xl:hidden p-4 space-y-4">
        <PlayerInfo
          name={bottomPlayerName}
          isTurn={currentTurn === bottomPlayerColor}
          capturedCount={bottomCapturedCount}
          pieceColor={bottomPlayerColor}
        />
        <div className="flex gap-2">
          <button
            onClick={handleBackToMenu}
            className="flex items-center justify-center px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition"
          >
            <Icon icon="mdi:arrow-left" className="text-lg" />
          </button>
          {!isMultiplayer && (
            <button
              onClick={() => getHint()}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition text-sm"
            >
              <Icon icon="mdi:lightbulb-outline" className="text-lg" />
              <span>{t.game.hint}</span>
            </button>
          )}
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
