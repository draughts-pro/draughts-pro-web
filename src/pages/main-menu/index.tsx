import { AppRoute } from "@/App";
import GlassButton from "@/components/GlassButton";
import { translationsAtom } from "@/i18n";
import { useAtomValue } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <div className="text-center mb-16 px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-white">
          {t.mainMenu.appName}
        </h1>
        <p className="text-lg text-gray-400 mt-2">{t.mainMenu.appDesc}</p>
      </div>
      <div className="flex flex-col space-y-5 w-full max-w-xs">
        <GlassButton onClick={() => navigate(AppRoute.game)}>
          {t.mainMenu.playAI}
        </GlassButton>
        <GlassButton onClick={() => navigate(AppRoute.multiplayerLobby)}>
          {t.mainMenu.playRemote}
        </GlassButton>
        <GlassButton onClick={() => navigate(AppRoute.settings)}>
          {t.mainMenu.settings}
        </GlassButton>
      </div>
    </div>
  );
};

export default MainMenu;
