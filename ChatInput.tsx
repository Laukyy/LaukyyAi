"use client";

import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend();
    }
  };

  return (
    <div className="flex items-end gap-2 bg-[#1a1a1c] border border-neutral-800 rounded-2xl px-3 py-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tanya apa aja ke Lauky... (Enter kirim, Shift+Enter baris baru)"
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent outline-none text-[15px] placeholder:text-neutral-500 max-h-40 py-1.5"
        style={{ minHeight: "24px" }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
        aria-label="Kirim pesan"
      >
        <Send size={16} className="text-white" />
      </button>
    </div>
  );
}
