import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import en from "./en.json";
import fr from "./fr.json";

export type Language = "en" | "fr";

export const translations = {
  en,
  fr,
} as const;

const getDefaultLanguage = (): Language => {
  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith("fr")) {
    return "fr";
  }
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
    document.title = t.meta.title;
    document.documentElement.lang = language;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t.meta.description);
    }
  }, [t, language]);
};
