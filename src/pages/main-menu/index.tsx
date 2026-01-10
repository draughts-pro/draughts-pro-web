import { AppRoute } from "@/App";
import GlassButton from "@/components/GlassButton";
import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="text-center mb-16 px-4">
        <h1 className="text-6xl md:text-8xl font-bold font-stylish text-white">
          {t.mainMenu.appName}
        </h1>
        <p className="text-lg text-gray-200 mt-2">{t.mainMenu.appDesc}</p>
      </div>
      <div className="flex flex-col space-y-5 w-full max-w-xs">
        <GlassButton onClick={() => navigate(AppRoute.game)}>
          {t.mainMenu.playAI}
        </GlassButton>
        <GlassButton onClick={() => navigate(AppRoute.multiplayerLobby)}>
          {t.mainMenu.playRemote}
        </GlassButton>
        <GlassButton
          onClick={() => navigate(AppRoute.settings)}
          className="group relative overflow-hidden"
        >
          <div className="flex flex-col gap-4 w-full px-4">
            <span>{t.mainMenu.settings}</span>
            <div className="flex gap-2 children:ring-1 children:ring-white/20 opacity-80 group-hover:opacity-100 transition-opacity">
              <Icon icon="circle-flags:gb" className="w-5 h-5" />
              <Icon icon="circle-flags:fr" className="w-5 h-5" />
              <Icon icon="circle-flags:nl" className="w-5 h-5" />
              <Icon icon="circle-flags:es" className="w-5 h-5" />
              <Icon icon="circle-flags:br" className="w-5 h-5" />
              <Icon icon="circle-flags:ru" className="w-5 h-5" />
              <Icon icon="circle-flags:ua" className="w-5 h-5" />
            </div>
          </div>
        </GlassButton>
        <button
          onClick={() =>
            window.open(
              "https://github.com/draughts-pro/draughts-pro-web/issues/new",
              "_blank"
            )
          }
          className="flex items-center justify-center gap-2 text-xs font-semibold text-white transition-colors pt-4 opacity-60 hover:opacity-100"
        >
          <Icon icon="lucide:message-square" className="w-4 h-4" />
          <span>{t.mainMenu.support}</span>
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
