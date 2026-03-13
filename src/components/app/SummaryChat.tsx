import { useState, useRef, useEffect } from "react";
import { theme } from "@/theme/config";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { DebtInput } from "@/lib/debtEngine";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SummaryChatProps {
  debtData: object;
}

function sanitizeInput(val: string): string {
  return val
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, 500)
    .trim();
}

const SummaryChat = ({ debtData }: SummaryChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const sanitized = sanitizeInput(input);
    if (!sanitized) return;

    const userMsg: ChatMessage = { role: "user", content: sanitized };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("april-chat", {
        body: {
          message: sanitized,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          debtData,
          context: "summary",
        },
      });

      const reply =
        !error && data?.reply
          ? data.reply
          : "I'm having a little trouble right now — please try again in a moment.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having a little trouble right now — please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const latestAnswer = messages.length > 0 ? messages[messages.length - 1] : null;
  const previousPairs = messages.slice(0, -2);

  return (
    <div className="mt-10 print:hidden">
      {/* Header */}
      <h3 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
        Have a question about your numbers?
      </h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Ask one question at a time — I'll answer based on your specific debt picture.
      </p>

      {/* Previous Q&A history */}
      {previousPairs.length > 0 && (
        <div ref={scrollRef} className="mt-4 space-y-3 max-h-60 overflow-y-auto">
          {previousPairs.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3.5 py-2.5 font-body text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/10 text-muted-foreground"
                    : "text-muted-foreground"
                }`}
                style={{ borderRadius: theme.radius.button }}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. What happens if I increase my surplus by $100?"
          className="flex-1 font-body text-sm"
          style={{ borderRadius: theme.radius.input }}
          disabled={loading}
          aria-label="Ask a question about your debt analysis"
        />
        <Button
          size="sm"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4"
          style={{ borderRadius: theme.radius.button }}
          aria-label="Ask question"
        >
          {loading ? (
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            "Ask"
          )}
        </Button>
      </div>

      {/* Latest answer card */}
      {latestAnswer && latestAnswer.role === "assistant" && (
        <Card
          className="mt-4 border-0 overflow-hidden"
          style={{
            borderRadius: theme.radius.card,
            borderLeft: `3px solid hsl(var(--secondary))`,
            background: "hsl(var(--background))",
          }}
        >
          <CardContent className="p-5">
            <div className="prose prose-sm max-w-none font-body text-sm text-foreground leading-relaxed">
              <ReactMarkdown>{latestAnswer.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typing indicator when loading and no answer yet */}
      {loading && (
        <div className="mt-4 flex justify-start">
          <div
            className="bg-card shadow-sm px-4 py-3 flex gap-1.5 items-center"
            style={{ borderRadius: theme.radius.button }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryChat;
