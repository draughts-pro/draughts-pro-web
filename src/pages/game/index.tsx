import { translationsAtom } from "@/i18n";
import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../../components/Board";
import GameButton from "../../components/ui/GameButton";
import { Icon } from "../../components/ui/icons";
import SoundToggle from "../../components/ui/SoundToggle";
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
  gameStatusAtom,
  isAiThinkingAtom,
  type GameStatus,
  type PieceColor,
} from "./utils/state";

/**
 * Per-side turn clock for the HUD. Display only: counts seconds spent on each
 * side's turns and resets whenever a new game starts.
 */
const useTurnClock = (turn: PieceColor, running: boolean, status: GameStatus) => {
  const [times, setTimes] = useState({ light: 0, dark: 0 });
  const [prevStatus, setPrevStatus] = useState(status);
  if (prevStatus !== status) {
    setPrevStatus(status);
    if (status === "playing") setTimes({ light: 0, dark: 0 });
  }
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimes((t) => ({ ...t, [turn]: t[turn] + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [turn, running]);
  return times;
};

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentTurn = useAtomValue(currentTurnAtom);
  const capturedPieces = useAtomValue(capturedPiecesAtom);
  const gameMode = useAtomValue(gameModeAtom);
  const isAiThinking = useAtomValue(isAiThinkingAtom);
  const gameStatus = useAtomValue(gameStatusAtom);
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
    ? multiplayerState.opponentName || t.game.opponent
    : aiLabel;

  const bottomPlayerColor = isMultiplayer ? (multiplayerState.playerColor || "light") : "light";
  const topPlayerColor = bottomPlayerColor === "light" ? "dark" : "light";

  const bottomCapturedCount = capturedPieces[topPlayerColor as "light" | "dark"];
  const topCapturedCount = capturedPieces[bottomPlayerColor as "light" | "dark"];

  const clocks = useTurnClock(currentTurn, gameStatus === "playing", gameStatus);

  const kbd = (key: string) => (
    <kbd className="hidden lg:inline-block relative ml-1 rounded-md px-1.5 py-0.5 text-[0.7rem] font-black bg-black/15">
      {key}
    </kbd>
  );

  return (
    <div className="screen flex flex-col gap-3 overflow-hidden">
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
        ribbon={confirmModalState.type === "backToMenu" ? t.game.backToMenu : t.game.forfeit}
      />

      <header className="flex items-center gap-3">
        <GameButton tone="slate" size="icon" onClick={handleBackToMenu} aria-label={t.game.backToMenu}>
          <Icon name="back" className="w-6 h-6 relative" />
        </GameButton>
        <div className="flex-1 min-w-0 text-center">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-text-dim">{t.game.gameMode}</p>
          <p className="truncate text-sm sm:text-base font-black">{t.variants[preferences.variant]}</p>
        </div>
        <SoundToggle />
      </header>

      <div className="game-grid flex-1 min-h-0">
        <PlayerInfo
          className="[grid-area:top]"
          name={topPlayerName}
          isTurn={currentTurn === topPlayerColor}
          capturedCount={topCapturedCount}
          pieceColor={topPlayerColor}
          isComputer={!isMultiplayer}
          isRival={isMultiplayer}
          isThinking={isAiThinking}
          clockSeconds={clocks[topPlayerColor]}
        />

        <div className="board-stage [grid-area:board]">
          <Board />
        </div>

        <PlayerInfo
          className="[grid-area:bottom]"
          name={bottomPlayerName}
          isTurn={currentTurn === bottomPlayerColor}
          capturedCount={bottomCapturedCount}
          pieceColor={bottomPlayerColor}
          clockSeconds={clocks[bottomPlayerColor]}
        />

        <div className="[grid-area:actions] flex gap-3">
          {!isMultiplayer && (
            <GameButton tone="gold" size="md" className="flex-1" onClick={() => getHint()}>
              <Icon name="bulb" className="w-6 h-6 relative" />
              <span className="relative">{t.game.hint}</span>
              {kbd("H")}
            </GameButton>
          )}
          <GameButton
            tone="red"
            size="md"
            className={isMultiplayer ? "flex-1" : "flex-1 max-w-[46%]"}
            onClick={handleForfeit}
          >
            <Icon name="flag" className="w-6 h-6 relative" />
            <span className="relative">{t.game.forfeit}</span>
            {kbd("F")}
          </GameButton>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
