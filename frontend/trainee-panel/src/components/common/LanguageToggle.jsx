import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang, languages } = useLanguage();

  return (
    <label className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-soft">
      <Languages size={14} />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent text-xs font-medium text-ink-soft focus:outline-none"
        aria-label="Choose language"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
