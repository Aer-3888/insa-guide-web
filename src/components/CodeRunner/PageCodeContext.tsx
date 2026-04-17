import {createContext, useContext, useRef, useCallback, useEffect} from 'react';
import type {ReactNode} from 'react';

interface PageCodeEntry {
  id: number;
  language: string;
  code: string;
}

interface PageCodeContextValue {
  register: (language: string, code: string) => number;
  getPrecedingBlocks: (id: number, language: string) => string[];
}

const PageCodeContext = createContext<PageCodeContextValue | null>(null);

export function PageCodeProvider({children}: {children: ReactNode}): ReactNode {
  const entriesRef = useRef<PageCodeEntry[]>([]);
  const nextIdRef = useRef(0);

  const register = useCallback((language: string, code: string): number => {
    const id = nextIdRef.current++;
    entriesRef.current.push({id, language, code});
    return id;
  }, []);

  const getPrecedingBlocks = useCallback(
    (id: number, language: string): string[] => {
      return entriesRef.current
        .filter((entry) => entry.id < id && entry.language === language)
        .map((entry) => entry.code);
    },
    [],
  );

  return (
    <PageCodeContext.Provider value={{register, getPrecedingBlocks}}>
      {children}
    </PageCodeContext.Provider>
  );
}

export function usePageCode(language: string, code: string) {
  const ctx = useContext(PageCodeContext);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    if (ctx && idRef.current === null) {
      idRef.current = ctx.register(language, code);
    }
  }, [ctx, language, code]);

  const getPrecedingBlocks = useCallback((): string[] => {
    if (!ctx || idRef.current === null) return [];
    return ctx.getPrecedingBlocks(idRef.current, language);
  }, [ctx, language]);

  return {getPrecedingBlocks};
}
