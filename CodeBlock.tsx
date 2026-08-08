"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Kalau clipboard API gagal (misal browser lama), diamkan saja.
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-neutral-700">
      <div className="flex items-center justify-between bg-neutral-800 px-3 py-1.5 text-xs text-neutral-400">
        <span>{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-orange-400 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.85rem",
          background: "#161618",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
