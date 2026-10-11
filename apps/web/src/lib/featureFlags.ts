/**
 * Local preference flags. The 3D layers and the anime.js demo layer can both
 * be switched off from the student's settings without a page reload.
 */
const STORAGE_KEY = "3talab_3d";
const MOTION_KEY = "3talab_motion";

type Listener = () => void;
const listeners = new Set<Listener>();
const motionListeners = new Set<Listener>();

export function is3DEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
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

/** False when the student asked for fewer animations in Settings. */
export function isMotionReduced(): boolean {
  try {
    return localStorage.getItem(MOTION_KEY) === "off";
  } catch {
    return true;
  }
}

export function setMotionReduced(reduced: boolean): void {
  try {
    if (reduced) localStorage.setItem(MOTION_KEY, "off");
    else localStorage.removeItem(MOTION_KEY);
  } catch {
    // Toggle still works for the current session.
  }
  motionListeners.forEach((listener) => listener());
}

export function subscribeMotionPreference(listener: Listener): () => void {
  motionListeners.add(listener);
  return () => {
    motionListeners.delete(listener);
  };
}
