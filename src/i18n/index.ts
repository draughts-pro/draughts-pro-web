import { atom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import nl from "./nl.json";
import pt from "./pt.json";
import ru from "./ru.json";
import uk from "./uk.json";

export type Language = "en" | "fr" | "nl" | "pt" | "es" | "ru" | "uk";

export const translations = {
  en,
  fr,
  nl,
  pt,
  es,
  ru,
  uk,
} as const;

const getDefaultLanguage = (): Language => {
  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith("fr")) return "fr";
  if (browserLanguage.startsWith("nl")) return "nl";
  if (browserLanguage.startsWith("pt")) return "pt";
  if (browserLanguage.startsWith("es")) return "es";
  if (browserLanguage.startsWith("ru")) return "ru";
  if (browserLanguage.startsWith("uk")) return "uk";
  return "en";
};

export const languageAtom = atomWithStorage<Language>(
  "app.language",
  getDefaultLanguage()
);

export const translationsAtom = atom((get) => {
  const language = get(languageAtom);
  return translations[language];
});

export const useDocumentMeta = () => {
  const t = useAtomValue(translationsAtom);
  const language = useAtomValue(languageAtom);

  useEffect(() => {
    const isOffline = import.meta.env.VITE_OFFLINE_MODE === "true";
    
    document.title = isOffline 
      ? (t.meta as any).titleOffline || `Draughts Pro - ${t.mainMenu.playAI}`
      : t.meta.title;
      
    document.documentElement.lang = language;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", isOffline 
        ? (t.meta as any).descriptionOffline || "Play checkers locally against AI. Free browser-based checkers game with smooth gameplay."
        : t.meta.description
      );
    }
  }, [t, language]);
};
