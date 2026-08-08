"use client";

import { MessageSquarePlus, Trash2, X } from "lucide-react";
import clsx from "clsx";

export type Conversation = {
  id: string;
  title: string;
};

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay untuk mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed md:static z-30 top-0 left-0 h-full w-72 bg-[#141416] border-r border-neutral-800 flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-neutral-800">
          <div className="font-bold text-orange-500 text-lg">Lauky AI</div>
          <button onClick={onClose} className="md:hidden text-neutral-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 justify-center bg-orange-600 hover:bg-orange-500 transition-colors text-white text-sm font-medium py-2 rounded-lg"
          >
            <MessageSquarePlus size={16} />
            Percakapan Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-neutral-500 text-xs text-center mt-6 px-4">
              Belum ada riwayat percakapan. Mulai ngobrol sama Lauky dulu,
              bro.
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={clsx(
                "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm truncate transition-colors",
                c.id === activeId
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-800/60"
              )}
            >
              <span className="truncate">{c.title || "Percakapan baru"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity shrink-0 ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-neutral-800 text-xs text-neutral-500">
          Pintar boleh. Galak boleh. Ngasal jangan. 😈
        </div>
      </aside>
    </>
  );
}
