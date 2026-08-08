"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import ChatMessage, { Role } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar, { Conversation } from "@/components/Sidebar";

type Message = {
  role: Role;
  content: string;
};

type StoredConversation = Conversation & {
  messages: Message[];
};

const STORAGE_KEY = "lauky-ai-conversations";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Home() {
  const [conversations, setConversations] = useState<StoredConversation[]>(
    []
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load riwayat dari localStorage saat pertama kali dibuka
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: StoredConversation[] = JSON.parse(raw);
        setConversations(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } catch {
        // data korup, abaikan
      }
    }
  }, []);

  // Simpan ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  const handleNewConversation = () => {
    const newConv: StoredConversation = {
      id: uid(),
      title: "Percakapan baru",
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const updateConversationMessages = (id: string, msgs: Message[]) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: msgs,
              title:
                c.title === "Percakapan baru" && msgs[0]
                  ? msgs[0].content.slice(0, 40)
                  : c.title,
            }
          : c
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setError(null);

    let convId = activeId;
    let currentMessages = messages;

    // Kalau belum ada percakapan aktif, bikin dulu
    if (!convId) {
      const newConv: StoredConversation = {
        id: uid(),
        title: "Percakapan baru",
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      currentMessages = [];
      setActiveId(convId);
    }

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...currentMessages, userMessage];
    updateConversationMessages(convId, updatedMessages);
    setInput("");
    setLoading(true);

    // Tambahkan placeholder untuk jawaban assistant yang akan di-stream
    const withPlaceholder = [...updatedMessages, { role: "assistant" as Role, content: "" }];
    updateConversationMessages(convId, withPlaceholder);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Gagal menghubungi server Lauky AI.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        const streamedMessages = [
          ...updatedMessages,
          { role: "assistant" as Role, content: fullText },
        ];
        updateConversationMessages(convId, streamedMessages);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui."
      );
      // Buang placeholder kosong kalau gagal total
      updateConversationMessages(convId, updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-[#0f0f10] text-neutral-100">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-neutral-400"
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="font-semibold text-sm">Lauky AI</div>
            <div className="text-xs text-neutral-500">
              Cerdas. Tegas. Sedikit galak. 😈
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 gap-2">
              <div className="text-2xl font-bold text-orange-500">
                Lauky AI
              </div>
              <p className="max-w-sm text-sm">
                Tanya apa aja — programming, debugging, tugas sekolah, sampe
                curhat soal error yang bikin pusing. Gua bantu, tapi kalau lu
                salah ya gua bilang salah. 😏
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="flex items-center gap-1 px-4 text-neutral-500">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full typing-dot" />
              <span
                className="w-1.5 h-1.5 bg-orange-500 rounded-full typing-dot"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-1.5 h-1.5 bg-orange-500 rounded-full typing-dot"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          )}
          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-neutral-800">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={loading}
          />
        </div>
      </div>
    </main>
  );
                     }
