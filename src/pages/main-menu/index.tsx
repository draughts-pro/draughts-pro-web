import { AppRoute } from "@/App";
import { MiniPiece } from "@/components/Piece";
import GameButton from "@/components/ui/GameButton";
import { Icon } from "@/components/ui/icons";
import SoundToggle from "@/components/ui/SoundToggle";
import { translationsAtom } from "@/i18n";
import { useAtomValue } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);

  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

  return (
    <div className="screen screen-scroll flex flex-col">
      <header className="flex justify-end">
        <SoundToggle />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-0 py-4">
        {/* hero pieces: a crowned king flanked by two men */}
        <div className="relative h-28 w-64 sm:h-36 sm:w-80 mb-2" aria-hidden>
          <span className="float absolute left-2 top-8 sm:top-10" style={{ "--r": "-10deg" } as React.CSSProperties}>
            <MiniPiece color="dark" size={76} />
          </span>
          <span
            className="float absolute left-1/2 -translate-x-1/2 top-0"
            style={{ "--r": "4deg", animationDelay: "-1.2s" } as React.CSSProperties}
          >
            <MiniPiece color="light" isKing size={104} />
          </span>
          <span
            className="float absolute right-2 top-10 sm:top-12"
            style={{ "--r": "8deg", animationDelay: "-2.1s" } as React.CSSProperties}
          >
            <MiniPiece color="dark" isKing size={64} />
          </span>
        </div>

        <h1 className="game-title title-bounce text-[clamp(3.4rem,15vw,6.5rem)] px-2 break-words max-w-full">
          {t.mainMenu.appName}
        </h1>
        <p
          className="pop-in mt-5 max-w-xs text-balance text-base sm:text-lg font-bold text-text-muted"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          {isOfflineMode ? t.mainMenu.playAI : t.mainMenu.appDesc}
        </p>
      </div>

      <nav className="w-full max-w-sm mx-auto flex flex-col gap-5 pb-2">
        <GameButton
          tone="green"
          size="lg"
          className="pop-in w-full"
          style={{ "--i": 3 } as React.CSSProperties}
          onClick={() => navigate(AppRoute.game)}
        >
          <Icon name="play" className="w-7 h-7 relative" />
          <span className="relative">{t.mainMenu.playAI}</span>
        </GameButton>
        {!isOfflineMode && (
          <GameButton
            tone="blue"
            size="lg"
            className="pop-in w-full"
            style={{ "--i": 4 } as React.CSSProperties}
            onClick={() => navigate(AppRoute.multiplayerLobby)}
          >
            <Icon name="users" className="w-7 h-7 relative" />
            <span className="relative">{t.mainMenu.playRemote}</span>
          </GameButton>
        )}
        <GameButton
          tone="gold"
          size="md"
          className="pop-in w-full"
          style={{ "--i": 5 } as React.CSSProperties}
          onClick={() => navigate(AppRoute.settings)}
        >
          <Icon name="gear" className="w-6 h-6 relative" />
          <span className="relative">{t.mainMenu.settings}</span>
        </GameButton>
        <a
          href="https://github.com/draughts-pro/draughts-pro-web/issues/new"
          target="_blank"
          rel="noreferrer"
          className="pop-in self-center inline-flex items-center gap-2 min-h-11 px-4 text-sm font-extrabold text-text-dim"
          style={{ "--i": 6 } as React.CSSProperties}
        >
          <Icon name="chat" className="w-4 h-4" />
          <span>{t.mainMenu.support}</span>
        </a>
      </nav>
    </div>
  );
};

export default MainMenu;
