import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────
// LifeLane Settings – single source of truth
// Persisted to localStorage under "lifelane_settings".
// ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  // System preferences
  reducedMotion: boolean;
  autoSave: boolean;
  telemetryRate: "0.5s" | "1s" | "2s" | "5s";
  mapStyle: string;
  language: string;

  // Notifications
  alertSound: boolean;
  p1Alerts: boolean;
  p2Alerts: boolean;
  p3Alerts: boolean;
  signalAlerts: boolean;
  hospitalAlerts: boolean;
  alertChannel: string;

  // Priority rules
  p1GreenDuration: number;
  p2GreenDuration: number;
  p3GreenDuration: number;
  autoOverride: boolean;
  corridorMode: string;
  priorityMode: string;

  // Signal control
  prepareWindow: number;   // seconds before arrival to PREPARE
  activeWindow: number;    // seconds before arrival to ACTIVE GREEN
  extendStep: number;      // seconds added per Extend Green click
  autoReset: boolean;
  conflictMode: string;

  // Simulation
  simEnabled: boolean;
  simSpeed: "0.5×" | "1×" | "2×" | "5×" | "10×";
  simScenario: string;

  // Profile (also synced from Home)
  operatorName: string;
  email: string;
  shift: string;
}

export const DEFAULTS: AppSettings = {
  reducedMotion: false,
  autoSave: true,
  telemetryRate: "1s",
  mapStyle: "Signal Noir",
  language: "English",

  alertSound: true,
  p1Alerts: true,
  p2Alerts: true,
  p3Alerts: false,
  signalAlerts: true,
  hospitalAlerts: true,
  alertChannel: "In-app + Toast",

  p1GreenDuration: 45,
  p2GreenDuration: 40,
  p3GreenDuration: 30,
  autoOverride: true,
  corridorMode: "Fully automated",
  priorityMode: "ETA-based",

  prepareWindow: 90,
  activeWindow: 30,
  extendStep: 30,
  autoReset: true,
  conflictMode: "Highest priority wins",

  simEnabled: true,
  simSpeed: "1×",
  simScenario: "Standard city traffic",

  operatorName: "Alex Smith",
  email: "alex.smith@lifelane.city",
  shift: "Shift A",
};

const LS_KEY = "lifelane_settings";

function loadFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULTS };
    // merge with defaults so any new keys added in future are present
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveToStorage(s: AppSettings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch { /* storage unavailable – silently ignore */ }
}

// ── Context shape ─────────────────────────────
interface SettingsContextValue {
  /** The currently saved (committed) settings – what the app runs on */
  settings: AppSettings;
  /** Commit a full settings object and persist it */
  commit: (s: AppSettings) => void;
  /** Reset saved settings to factory defaults */
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadFromStorage);

  const commit = useCallback((s: AppSettings) => {
    setSettings(s);
    saveToStorage(s);
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveToStorage({ ...DEFAULTS });
  }, []);

  // Apply reduced-motion class to <html> whenever the setting changes
  useEffect(() => {
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty("--motion-duration", "0.001ms");
    } else {
      document.documentElement.style.removeProperty("--motion-duration");
    }
  }, [settings.reducedMotion]);

  return (
    <SettingsContext.Provider value={{ settings, commit, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
}

/** Throws if used outside SettingsProvider */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
