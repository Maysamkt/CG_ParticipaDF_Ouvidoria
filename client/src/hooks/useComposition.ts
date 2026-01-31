import { useCallback, useEffect, useRef } from "react";

export interface UseCompositionReturn<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onCompositionStart: React.CompositionEventHandler<T>;
  onCompositionEnd: React.CompositionEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  isComposing: () => boolean;
}

export interface UseCompositionOptions<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onKeyDown?: React.KeyboardEventHandler<T>;
  onCompositionStart?: React.CompositionEventHandler<T>;
  onCompositionEnd?: React.CompositionEventHandler<T>;
}

type TimerHandle = ReturnType<typeof setTimeout>;

export function useComposition<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options: UseCompositionOptions<T> = {}): UseCompositionReturn<T> {
  const { onKeyDown, onCompositionStart, onCompositionEnd } = options;

  const composingRef = useRef(false);
  const t1 = useRef<TimerHandle | null>(null);
  const t2 = useRef<TimerHandle | null>(null);

  const clearTimers = useCallback(() => {
    if (t1.current) {
      clearTimeout(t1.current);
      t1.current = null;
    }
    if (t2.current) {
      clearTimeout(t2.current);
      t2.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const handleCompositionStart = useCallback<React.CompositionEventHandler<T>>(
    e => {
      clearTimers();
      composingRef.current = true;
      onCompositionStart?.(e);
    },
    [clearTimers, onCompositionStart]
  );

  const handleCompositionEnd = useCallback<React.CompositionEventHandler<T>>(
    e => {
      /**
       * Safari/IME quirk:
       * Em alguns casos, o evento compositionEnd pode ocorrer antes do onKeyDown.
       * Usamos dois setTimeouts para garantir que o estado "composing" seja desligado
       * depois que os eventos de teclado associados tiverem ocorrido.
       */
      t1.current = setTimeout(() => {
        t2.current = setTimeout(() => {
          composingRef.current = false;
        }, 0);
      }, 0);

      onCompositionEnd?.(e);
    },
    [onCompositionEnd]
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<T>>(
    e => {
      // Durante composição (IME), bloqueia propagação de ESC e Enter (exceto shift+Enter).
      if (
        composingRef.current &&
        (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey))
      ) {
        e.stopPropagation();
        return;
      }
      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  const isComposing = useCallback(() => composingRef.current, []);

  return {
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
    isComposing,
  };
}
