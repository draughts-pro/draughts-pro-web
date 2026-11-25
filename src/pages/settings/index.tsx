import GameButton from "@/components/ui/GameButton";
import { Icon } from "@/components/ui/icons";
import { languageAtom, translationsAtom, type Language } from "@/i18n";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { useNavigate } from "react-router-dom";
import { preferencesAtom, type Difficulty } from "./utils/preferences";
import { variants } from "./utils/variants";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "nl", label: "Nederlands" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
];

const Section: React.FC<{ title: string; children: React.ReactNode; i: number }> = ({ title, children, i }) => (
  <section className="pop-in" style={{ "--i": i } as React.CSSProperties}>
    <h2 className="mb-3 text-sm font-black uppercase tracking-[0.1em] text-card-text-muted">{title}</h2>
    {children}
  </section>
);

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useAtom(preferencesAtom);
  const t = useAtomValue(translationsAtom);
  const [language, setLanguage] = useAtom(languageAtom);

  const levelText = (lvl: Difficulty) => {
    return [t.settings.easy, t.settings.medium, t.settings.hard, t.settings.master][lvl - 1];
  };

  return (
    <div className="screen screen-scroll">
      <div className="mx-auto w-full max-w-lg flex flex-col gap-6 pb-4">
        <header className="flex items-center gap-3">
          <GameButton tone="slate" size="icon" onClick={() => navigate("/")} aria-label={t.settings.backToMenu}>
            <Icon name="back" className="w-6 h-6 relative" />
          </GameButton>
          <h1 className="flex-1 text-center text-3xl sm:text-4xl font-black text-stroke">{t.settings.title}</h1>
          <span className="w-12" aria-hidden />
        </header>

        <div className="card p-5 sm:p-6 flex flex-col gap-7">
          <Section title={t.settings.sound} i={0}>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-card-sunk px-4 py-3">
              <span className="inline-flex items-center gap-3 font-black text-lg">
                <Icon name={preferences.sound ? "sound" : "mute"} className="w-6 h-6" />
                {t.settings.sound}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.sound}
                aria-label={t.settings.sound}
                className="toggle"
                onClick={() => setPreferences((pref) => ({ ...pref, sound: !pref.sound }))}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </Section>

          <Section title={t.settings.gameVariant} i={1}>
            <div className="flex flex-col gap-3" role="radiogroup" aria-label={t.settings.gameVariant}>
              {(Object.keys(variants) as (keyof typeof variants)[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={key === preferences.variant}
                  className="choice flex items-center gap-3 text-left"
                  onClick={() => setPreferences((pref) => ({ ...pref, variant: key }))}
                >
                  <span className="num shrink-0 rounded-lg bg-black/10 px-2 py-1 text-xs font-black">
                    {variants[key].boardSize}×{variants[key].boardSize}
                  </span>
                  <span className="flex-1 leading-tight">{t.variants[key]}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title={t.settings.difficulty} i={2}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-label={t.settings.difficulty}>
              {([1, 2, 3, 4] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={preferences.difficulty === level}
                  className="choice flex flex-col items-center gap-1"
                  onClick={() => setPreferences((pref) => ({ ...pref, difficulty: level }))}
                >
                  <span className="flex gap-0.5" aria-hidden>
                    {[1, 2, 3, 4].map((pip) => (
                      <span
                        key={pip}
                        className={`h-2 w-2 rounded-full ${pip <= level ? "bg-current" : "bg-current opacity-25"}`}
                      />
                    ))}
                  </span>
                  <span>{levelText(level)}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title={t.settings.language} i={3}>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.settings.language}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={language === lang.code}
                  lang={lang.code}
                  className="choice odd:last:col-span-2"
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <GameButton tone="green" size="lg" className="w-full" onClick={() => navigate("/")}>
          <Icon name="check" className="w-6 h-6 relative" />
          <span className="relative">{t.settings.backToMenu}</span>
        </GameButton>
      </div>
    </div>
  );
};

export default Settings;
