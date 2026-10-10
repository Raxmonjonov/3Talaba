/**
 * Shown while a WebGL chunk is still on the wire. It sits inside the scene's
 * own layer, so the headline and the 2D motifs above it stay fully readable
 * the whole time — the loader is a hint, never a gate.
 */
export function SceneLoader() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <span className="scene-loader" />
    </div>
  );
}
