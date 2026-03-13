import { useState, useRef, useEffect } from "react";
import { theme } from "@/theme/config";
import { ChevronRight, ChevronDown, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface IntakeChatbotProps {
  onTranscriptChange: (transcript: string) => void;
}

function sanitizeInput(val: string): string {
  return val
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, 500)
    .trim();
}

const OPENING_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm here if you'd like to share anything about your financial situation that might add context to your debt picture. You might mention things like income variability, upcoming expenses, or how long you've been managing these debts. I'm not here to give advice — just to listen and help personalize your summary. What's on your mind?",
};

const IntakeChatbot = ({ onTranscriptChange }: IntakeChatbotProps) => {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with opening message on first expand
  useEffect(() => {
    if (expanded && !initialized) {
      setMessages([OPENING_MESSAGE]);
      setInitialized(true);
    }
  }, [expanded, initialized]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Sync transcript upstream
  useEffect(() => {
    if (messages.length === 0) return;
    const transcript = messages
      .map((m) => `${m.role === "user" ? "User" : "APRil"}: ${m.content}`)
      .join("\n");
    onTranscriptChange(transcript);
  }, [messages, onTranscriptChange]);

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
          context: "intake",
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

  return (
    <div className="mb-8 print:hidden">
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 font-body text-sm text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
      >
        <MessageCircle size={16} />
        <span>Tell {theme.brand.name} more about your situation (optional)</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Chat panel */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: expanded ? "500px" : "0",
          opacity: expanded ? 1 : 0,
          marginTop: expanded ? "12px" : "0",
        }}
      >
        <div
          className="border border-primary/20 bg-background overflow-hidden"
          style={{ borderRadius: theme.radius.card }}
        >
          {/* Message area */}
          <div
            ref={scrollRef}
            className="overflow-y-auto p-4 space-y-3"
            style={{ maxHeight: "280px" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3.5 py-2.5 font-body text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-card text-foreground shadow-sm"
                  }`}
                  style={{ borderRadius: theme.radius.button }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
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

          {/* Input area */}
          <div className="border-t border-primary/10 p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. I have a variable income, or I'm expecting a large expense next month..."
              className="flex-1 font-body text-sm"
              style={{ borderRadius: theme.radius.input }}
              disabled={loading}
              aria-label="Chat message input"
            />
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
              style={{ borderRadius: theme.radius.button }}
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeChatbot;
