import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { BaseRuntime } from './BaseRuntime';
import type {
  ExecutionOptions,
  ExecutionResult,
  RuntimeInfo,
  RuntimeStatus,
} from './types';
import { createRuntime, getRuntimeInfo } from './registry';

interface RuntimeState {
  runtime: BaseRuntime;
  status: RuntimeStatus;
}

interface RuntimeContextValue {
  getRuntime: (language: string) => BaseRuntime | null;
  getStatus: (language: string) => RuntimeStatus;
  execute: (
    language: string,
    code: string,
    options?: ExecutionOptions,
  ) => Promise<ExecutionResult>;
  interrupt: (language: string) => void;
  cleanup: (language: string) => void;
  subscribe: (
    language: string,
    listener: (status: RuntimeStatus) => void,
  ) => () => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export const RuntimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const runtimesRef = useRef<Map<string, RuntimeState>>(new Map());
  const listenersRef = useRef<Map<string, Set<(status: RuntimeStatus) => void>>>(
    new Map(),
  );

  const notifyListeners = useCallback(
    (language: string, status: RuntimeStatus) => {
      const listeners = listenersRef.current.get(language);
      if (listeners) {
        for (const listener of listeners) {
          listener(status);
        }
      }
    },
    [],
  );

  const updateStatus = useCallback(
    (language: string, status: RuntimeStatus) => {
      const state = runtimesRef.current.get(language);
      if (state) {
        runtimesRef.current.set(language, { ...state, status });
      }
      notifyListeners(language, status);
    },
    [notifyListeners],
  );

  const getOrCreateRuntime = useCallback(
    (language: string): RuntimeState => {
      const existing = runtimesRef.current.get(language);
      if (existing) {
        return existing;
      }

      const runtime = createRuntime(language);
      const state: RuntimeState = {
        runtime,
        status: runtime.getStatus(),
      };
      runtimesRef.current.set(language, state);
      return state;
    },
    [],
  );

  const contextValue: RuntimeContextValue = {
    getRuntime: useCallback(
      (language: string) => {
        return runtimesRef.current.get(language)?.runtime ?? null;
      },
      [],
    ),

    getStatus: useCallback(
      (language: string) => {
        return runtimesRef.current.get(language)?.status ?? 'unloaded';
      },
      [],
    ),

    execute: useCallback(
      async (
        language: string,
        code: string,
        options?: ExecutionOptions,
      ): Promise<ExecutionResult> => {
        const state = getOrCreateRuntime(language);
        updateStatus(language, 'loading');

        const result = await state.runtime.execute(code, options);
        const newStatus = state.runtime.getStatus();
        updateStatus(language, newStatus);

        return result;
      },
      [getOrCreateRuntime, updateStatus],
    ),

    interrupt: useCallback(
      (language: string) => {
        const state = runtimesRef.current.get(language);
        if (state) {
          state.runtime.interrupt();
          updateStatus(language, state.runtime.getStatus());
        }
      },
      [updateStatus],
    ),

    cleanup: useCallback(
      (language: string) => {
        const state = runtimesRef.current.get(language);
        if (state) {
          state.runtime.cleanup();
          runtimesRef.current.delete(language);
          notifyListeners(language, 'unloaded');
        }
      },
      [notifyListeners],
    ),

    subscribe: useCallback(
      (language: string, listener: (status: RuntimeStatus) => void) => {
        if (!listenersRef.current.has(language)) {
          listenersRef.current.set(language, new Set());
        }
        listenersRef.current.get(language)!.add(listener);

        return () => {
          listenersRef.current.get(language)?.delete(listener);
        };
      },
      [],
    ),
  };

  return (
    <RuntimeContext.Provider value={contextValue}>
      {children}
    </RuntimeContext.Provider>
  );
};

/**
 * Hook to interact with a specific language runtime.
 * Lazy-loads the runtime on first use and provides status updates.
 */
export function useRuntime(language: string): {
  runtime: BaseRuntime | null;
  status: RuntimeStatus;
  info: RuntimeInfo | undefined;
  execute: (
    code: string,
    options?: ExecutionOptions,
  ) => Promise<ExecutionResult>;
  interrupt: () => void;
} {
  const ctx = useContext(RuntimeContext);
  if (!ctx) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }

  const [status, setStatus] = useState<RuntimeStatus>(() =>
    ctx.getStatus(language),
  );

  // Subscribe to status changes for this language
  React.useEffect(() => {
    const unsubscribe = ctx.subscribe(language, setStatus);
    // Sync status on mount in case it changed
    setStatus(ctx.getStatus(language));
    return unsubscribe;
  }, [ctx, language]);

  const execute = useCallback(
    (code: string, options?: ExecutionOptions) =>
      ctx.execute(language, code, options),
    [ctx, language],
  );

  const interrupt = useCallback(
    () => ctx.interrupt(language),
    [ctx, language],
  );

  return {
    runtime: ctx.getRuntime(language),
    status,
    info: getRuntimeInfo(language),
    execute,
    interrupt,
  };
}
