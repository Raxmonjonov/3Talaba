export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const globalRef = globalThis as unknown as { __fluxLessonNotifierStarted?: boolean };
    if (globalRef.__fluxLessonNotifierStarted) return;
    globalRef.__fluxLessonNotifierStarted = true;

    const { dispatchDueLessonStartEmails } = await import("@/lib/applications/store");

    // Check every 30 seconds on the server and automatically email students when their 2-hour lesson starts
    const timer = setInterval(() => {
      void dispatchDueLessonStartEmails().catch(() => {});
    }, 30_000);

    if (typeof timer.unref === "function") {
      timer.unref();
    }
  }
}
