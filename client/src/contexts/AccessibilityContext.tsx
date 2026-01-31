import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: "normal" | "large" | "xlarge";
  reduceMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  toggleHighContrast: () => void;
  setFontSize: (size: AccessibilitySettings["fontSize"]) => void;
  toggleReduceMotion: () => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

const STORAGE_KEY = "ouvidoria-accessibility-settings";

function getSystemReduceMotionDefault(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

function getDefaultSettings(): AccessibilitySettings {
  return {
    highContrast: false,
    fontSize: "normal",
    reduceMotion: getSystemReduceMotionDefault(),
  };
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Inicializa lendo localStorage de forma segura
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...getDefaultSettings(), ...JSON.parse(stored) };
    } catch {
      // ignore
    }
    return getDefaultSettings();
  });

  // Monitora preferência do sistema (só se usuário não tiver “fixado” no storage)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const hasUserPreference = (() => {
      try {
        return Boolean(localStorage.getItem(STORAGE_KEY));
      } catch {
        return false;
      }
    })();

    const handleChange = (e: MediaQueryListEvent) => {
      // Se usuário já escolheu manualmente, não sobrescreve.
      if (hasUserPreference) return;

      setSettings(prev => ({
        ...prev,
        reduceMotion: e.matches,
      }));
    };

    // Compatibilidade
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // @ts-expect-error fallback antigo
      mediaQuery.addListener(handleChange);
      // @ts-expect-error fallback antigo
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Aplica settings no DOM + persiste
  useEffect(() => {
    // Persistência segura
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }

    const html = document.documentElement;

    html.classList.toggle("high-contrast", settings.highContrast);
    html.classList.toggle("reduce-motion", settings.reduceMotion);

    html.style.fontSize =
      settings.fontSize === "normal"
        ? "16px"
        : settings.fontSize === "large"
          ? "18px"
          : "20px";
  }, [settings]);

  const value = useMemo<AccessibilityContextType>(
    () => ({
      settings,
      toggleHighContrast: () =>
        setSettings(prev => ({ ...prev, highContrast: !prev.highContrast })),
      setFontSize: size => setSettings(prev => ({ ...prev, fontSize: size })),
      toggleReduceMotion: () =>
        setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion })),
      resetSettings: () => setSettings(getDefaultSettings()),
    }),
    [settings]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility deve ser usado dentro de AccessibilityProvider"
    );
  }
  return context;
}
