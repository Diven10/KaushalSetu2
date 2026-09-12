import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { STRINGS, LANGUAGES } from "../i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  const t = useCallback(
    (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key,
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t, languages: LANGUAGES }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
