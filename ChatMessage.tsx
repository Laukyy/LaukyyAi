"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import clsx from "clsx";

export type Role = "user" | "assistant";

export default function ChatMessage({
  role,
  content,
}: {
  role: Role;
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={clsx("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-orange-600 text-white rounded-br-sm"
            : "bg-[#1f2023] text-neutral-100 rounded-bl-sm border border-neutral-800"
        )}
      >
        {!isUser && (
          <div className="text-xs font-semibold text-orange-400 mb-1">
            Lauky AI
          </div>
        )}
        <div className="prose-lauky text-[15px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code(props) {
                const { children, className } = props;
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match;
                if (isInline) {
                  return <code className={className}>{children}</code>;
                }
                return (
                  <CodeBlock
                    language={match ? match[1] : ""}
                    code={String(children).replace(/\n$/, "")}
                  />
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
