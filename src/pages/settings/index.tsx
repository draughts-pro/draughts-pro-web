import GlassButton from "@/components/GlassButton";
import GlassCard from "@/components/GlassCard";
import { languageAtom, translationsAtom } from "@/i18n";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";
import { preferencesAtom } from "./preferences";
import { variants } from "./variants";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useAtom(preferencesAtom);
  const t = useAtomValue(translationsAtom);
  const [language, setLanguage] = useAtom(languageAtom);

  const levelText = (lvl: 1 | 2 | 3) => {
    return [t.settings.easy, t.settings.medium, t.settings.hard][lvl - 1];
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-dvh p-8 pt-16">
      <div className="relative w-full max-w-md mb-16">
        <button
          onClick={() => navigate("/")}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-lg transition"
          aria-label="Back to menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-5xl font-bold text-white text-center">
          {t.settings.title}
        </h1>
      </div>
      <div className="flex flex-col space-y-8 w-full max-w-md">
        <GlassCard>
          <div className="w-full flex items-center justify-between p-4">
            <span className="text-xl font-semibold text-white">
              {t.settings.sound}
            </span>
            <button
              onClick={() =>
                setPreferences((pref) => ({ ...pref, sound: !pref.sound }))
              }
              className={`relative inline-flex items-center h-8 rounded-full w-16 transition-colors duration-300 focus:outline-none ${
                preferences.sound ? "bg-accent-green" : "bg-accent-red"
              }`}
            >
              <span
                className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${
                  preferences.sound ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="w-full p-4">
            <label className="block text-xl font-semibold mb-4 text-white">
              {t.settings.gameVariant}
            </label>
            <div className="flex flex-col gap-4">
              {Object.entries(variants).map(([key]) => (
                <button
                  key={key}
                  onClick={() =>
                    setPreferences((pref) => ({
                      ...pref,
                      variant: key as keyof typeof variants,
                    }))
                  }
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                    key === preferences.variant
                      ? "bg-primary text-white"
                      : "bg-primary/50 hover:bg-gray-700"
                  }`}
                >
                  {t.variants[key as keyof typeof variants]}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="w-full p-4">
            <label className="block text-xl font-semibold mb-4 text-white">
              {t.settings.difficulty}
            </label>
            <div className="flex space-x-3">
              {([1, 2, 3] as const).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setPreferences((pref) => ({ ...pref, difficulty: level }))
                  }
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                    preferences.difficulty === level
                      ? "bg-primary text-white"
                      : "bg-primary/50 hover:bg-gray-700"
                  }`}
                >
                  {levelText(level)}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="w-full p-4">
            <label className="block text-xl font-semibold mb-4 text-white">
              {t.settings.language}
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setLanguage("en")}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                  language === "en"
                    ? "bg-primary text-white"
                    : "bg-primary/50 hover:bg-gray-700"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("fr")}
                className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                  language === "fr"
                    ? "bg-primary text-white"
                    : "bg-primary/50 hover:bg-gray-700"
                }`}
              >
                Français
              </button>
            </div>
          </div>
        </GlassCard>
        <GlassButton onClick={() => navigate("/")}>
          {t.settings.backToMenu}
        </GlassButton>
      </div>
    </div>
  );
};

export default Settings;
