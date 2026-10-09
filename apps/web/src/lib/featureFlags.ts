/**
 * The 3D layers can be switched off from the student's settings. The flag is a
 * tiny external store so every mounted scene reacts to the toggle at once
 * without a page reload.
 */
const STORAGE_KEY = "3talab_3d";

type Listener = () => void;
const listeners = new Set<Listener>();

export function is3DEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // Private mode or a storage quota: default to on.
    return true;
  }
}

export function set3DEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, "off");
  } catch {
    // Nothing we can do without storage; the toggle just will not persist.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe3D(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
