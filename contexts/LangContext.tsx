'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LANG_CONFIG, SUPPORTED_LANGS, Lang, LangStrings } from '@/config/translations';

interface LangCtx {
  lang: Lang | null;
  t: LangStrings | null;
  setLang: (l: Lang | null) => void;
}

const Ctx = createContext<LangCtx>({ lang: null, t: null, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved && (SUPPORTED_LANGS as readonly string[]).includes(saved)) {
      setLangState(saved as Lang);
    }
  }, []);

  const setLang = (l: Lang | null) => {
    setLangState(l);
    if (l) localStorage.setItem('lang', l);
    else localStorage.removeItem('lang');
  };

  const t = lang ? LANG_CONFIG[lang].t : null;

  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
