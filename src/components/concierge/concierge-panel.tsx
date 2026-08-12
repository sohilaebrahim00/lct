import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { X, Send, Loader2, ArrowRight } from "lucide-react";
import { sendConciergeMessage, type ConciergeMessage, type ConciergeAction } from "@/lib/concierge/client";
import { track } from "@/lib/tracking";

type DisplayMessage = ConciergeMessage & { actions?: ConciergeAction[]; escalate?: boolean };

const QUICK_ACTIONS = [
  { label: "Book a Ride", prompt: "I'd like to book a ride." },
  { label: "Choose a Vehicle", prompt: "Help me choose the right vehicle for my trip." },
  { label: "Airport Transfer", prompt: "I need an airport transfer." },
  { label: "Corporate Travel", prompt: "Tell me about corporate transportation." },
  { label: "Group Transportation", prompt: "I need transportation for a group." },
  { label: "Service Areas", prompt: "Do you serve my area?" },
  { label: "Join Our Team", prompt: "I want to join the team." },
  { label: "Contact Dispatch", prompt: "I need to speak with dispatch." },
] as const;

/** Page-aware opening suggestion — matches the current route to a relevant first prompt, per explicit context-awareness requirement. */
function suggestionForPath(pathname: string): string | null {
  if (pathname === "/fleet") return "Looking at our fleet? Ask me which vehicle fits your trip.";
  if (pathname === "/airport") return "Ask me about airport pickup, meet-and-greet, or waiting time.";
  if (pathname === "/service-areas") return "Ask me whether we serve a specific city.";
  if (pathname === "/join-our-team") return "Ask me about the Driver, Company Partner, or Referral Partner pathway.";
  if (pathname.startsWith("/blog")) return "Have a question about this article? I can also point you to the right service page.";
  if (pathname === "/corporate") return "Ask me about corporate accounts and executive travel.";
  return null;
}

const SESSION_KEY = "lct-concierge-history";
const RATE_LIMIT_MS = 2000;

export default function ConciergePanel({ onClose, dialogId }: { onClose: () => void; dialogId: string }) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSentAt = useRef(0);

  // Session-only history — cleared on tab close, never written with intent
  // to persist indefinitely (per explicit "do not persist sensitive
  // conversations indefinitely by default").
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-20)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const now = Date.now();
    if (now - lastSentAt.current < RATE_LIMIT_MS) return;
    lastSentAt.current = now;

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    const result = await sendConciergeMessage(
      trimmed,
      nextMessages.map((m) => ({ role: m.role, content: m.content })),
      pathname,
    );

    setMessages((prev) => [...prev, { role: "assistant", content: result.message, actions: result.actions, escalate: result.escalate }]);
    setSending(false);
  };

  const suggestion = suggestionForPath(pathname);

  return (
    <div
      id={dialogId}
      role="dialog"
      aria-modal="true"
      aria-label="LCT Universal AI Concierge"
      className="fixed inset-x-0 bottom-0 z-[45] flex max-h-[85vh] flex-col rounded-t-lg border-t border-x border-gold/30 bg-[color:var(--surface-black)] shadow-[0_-16px_48px_-16px_rgba(0,0,0,0.6)] sm:inset-auto sm:bottom-24 sm:left-4 sm:max-h-[32rem] sm:w-[23rem] sm:rounded-sm sm:border"
    >
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <div className="eyebrow text-gold">AI Concierge</div>
          <div className="text-xs text-muted-foreground">LCT Universal Executive Transportation</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-sm p-2 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {suggestion ?? "Ask about vehicles, service areas, airport transfers, or how to book."}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => send(qa.prompt)}
                  className="min-h-[36px] rounded-full border border-border px-3 py-1.5 text-xs text-foreground/80 transition hover:border-gold hover:text-gold"
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-sm px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-gold-gradient text-onyx" : "bg-[color:var(--surface-elevated)] text-foreground/90"
              }`}
            >
              <p>{m.content}</p>
              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.actions.map((a) => (
                    <Link
                      key={a.href}
                      to={a.href}
                      onClick={() => {
                        if (a.href === "/book") track.aiActionBookClicked();
                        if (a.href === "/contact") track.aiActionContactClicked();
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-gold/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold transition hover:bg-gold/10"
                    >
                      {a.label}
                      <ArrowRight className="h-3 w-3" aria-hidden />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Concierge is typing…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border/60 p-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          maxLength={600}
          autoComplete="off"
          className="min-h-[44px] flex-1 rounded-sm border border-border bg-background/60 px-3 text-base text-foreground outline-none focus:border-gold md:text-sm"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-gold-gradient text-onyx transition disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
