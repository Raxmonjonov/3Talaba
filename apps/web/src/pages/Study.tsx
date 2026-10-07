import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { ChatResponse, Message, Session, SessionWithMessages, User } from "../lib/types";

/** Soft reminder after this many focused minutes. Never forced. */
const BREAK_AFTER_MINUTES = 45;
/** Pomodoro cycle length in minutes. */
const CYCLE_MINUTES = 25;

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Study({ user }: { user: User }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(id ?? "");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const [elapsed, setElapsed] = useState(0);
  const [breakDue, setBreakDue] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const startedAtRef = useRef<number>(0);
  const loggedRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      try {
        if (id) {
          const session = await api<SessionWithMessages>(
            `/api/chat/sessions/${id}`
          );
          if (cancelled) return;
          setSessionId(session.id);
          setMessages(session.messages);
        } else {
          const session = await api<Session>("/api/chat/start", { method: "POST" });
          if (cancelled) return;
          setSessionId(session.id);
        }
        startedAtRef.current = Date.now();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Sessiya ochilmadi");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Ticking clock. Breaks are only ever suggested, never enforced.
  useEffect(() => {
    if (!ready) return;

    const timer = setInterval(() => {
      const minutes = Math.floor((Date.now() - startedAtRef.current) / 60000);
      setElapsed(minutes);

      if (minutes > 0 && minutes % CYCLE_MINUTES === 0 && minutes % BREAK_AFTER_MINUTES !== 0) {
        setBreakDue(true);
      }
      if (minutes > 0 && minutes % BREAK_AFTER_MINUTES === 0) {
        setBreakDue(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const persistProgress = useCallback(
    (minutes: number, completed: number) => {
      if (minutes <= 0) return;
      api("/api/learning/progress", {
        method: "POST",
        body: JSON.stringify({ minutes, completed }),
      }).catch(() => {
        /* progress logging is best-effort */
      });
    },
    []
  );

  // Flush study time when leaving the page.
  useEffect(() => {
    const flush = () => {
      const minutes = Math.floor((Date.now() - startedAtRef.current) / 60000);
      const delta = minutes - loggedRef.current;
      if (delta > 0) {
        persistProgress(delta, answerCount);
        loggedRef.current = minutes;
      }
    };

    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [persistProgress, answerCount]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending || !sessionId) return;

    setInput("");
    setSending(true);
    setError("");

    const optimistic: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setAnswerCount((c) => c + 1);

    try {
      const res = await api<ChatResponse>("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({ sessionId, message: text }),
      });
      setMessages((m) => [...m, res.message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xabar yuborilmadi");
    } finally {
      setSending(false);
    }
  }

  const address = user.preferredTitle || user.firstName;
  const inCycle = elapsed % CYCLE_MINUTES;
  const cycleProgress = Math.min(100, (inCycle / CYCLE_MINUTES) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-card/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-lg font-semibold">Dars</h1>
            <p className="text-xs text-muted-foreground">
              {address} bilan birga
              {user.focusMode ? " · fokus rejimi" : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-muted-foreground">
              {formatElapsed(elapsed * 60)}
            </span>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Chiqish
            </button>
          </div>
        </div>
        <div className="mx-auto mb-3 h-1.5 w-full max-w-3xl overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary/60 transition-all"
            style={{ width: `${cycleProgress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-5 py-8">
        {messages.length === 0 && ready && !sending ? (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            Savolimiz tayyor, {address}. Nimadan boshlaymiz?
          </p>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5">
                {m.content}
              </div>
            </div>
          )
        )}

        {sending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 text-muted-foreground">
              Yozmoqda…
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div ref={bottomRef} />
      </main>

      {breakDue && user.softConfirm ? (
        <div className="sticky bottom-0 border-t bg-secondary/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <p className="text-sm">
              {elapsed % BREAK_AFTER_MINUTES === 0 && elapsed > 0
                ? "45 daqiqa o‘tib ketdi. Bir oz turib, suv ichish ham mumkin."
                : "25 daqiqalik sikl tugadi. Davom etasizmi yoki tanaffus olasizmi?"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setBreakDue(false)}
                className="rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-card"
              >
                Davom etaman
              </button>
              <button
                onClick={() => {
                  setBreakDue(false);
                  startedAtRef.current = Date.now();
                }}
                className="rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-card"
              >
                Tanaffus oldim
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t bg-card/70 backdrop-blur-sm">
        <form
          onSubmit={send}
          className="mx-auto flex max-w-3xl items-end gap-3 px-5 py-4"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Javobingizni yozing…"
            className="field max-h-40 flex-1 resize-none"
          />
          <button
            disabled={sending || !input.trim()}
            className="btn-primary h-[46px] px-5"
          >
            Yuborish
          </button>
        </form>
      </footer>
    </div>
  );
}