import { AppRoute } from "@/App";
import GlassButton from "@/components/GlassButton";
import GlassCard from "@/components/GlassCard";
import { translationsAtom } from "@/i18n";
import { Icon } from "@iconify/react";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const t = useAtomValue(translationsAtom);
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <GlassCard>
              <div className="p-8 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Icon
                    icon="mdi:rocket-launch"
                    className="text-6xl text-blue-400"
                  />
                  <h2 className="text-3xl font-bold text-white">
                    {t.mainMenu.comingSoon}
                  </h2>
                  <p className="text-gray-300 text-center">
                    {t.mainMenu.comingSoonMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowComingSoon(false)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-accent-blue hover:bg-accent-blue/80 text-white font-semibold rounded-xl transition"
                >
                  <span>{t.mainMenu.ok}</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
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
        <GlassButton onClick={() => setShowComingSoon(true)}>
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
