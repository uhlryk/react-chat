import { type ReactNode, useEffect, useRef } from 'react';
import { ItemMessage } from './ItemMessage.js';
import type { ChatItem, ChatMessage } from './types.js';

interface ChatMessagesProps {
  messages: ChatMessage[];
  /** Shows a waiting marker after the last message (before the first token arrives). */
  loading?: boolean;
  onOpenItem?: (message: ChatItem) => void;
  /** Shown when there are no messages yet. */
  empty?: ReactNode;
}

/** The thread, oldest first, scrolled to its end as it grows. */
export function ChatMessages({ messages, loading = false, onOpenItem, empty }: ChatMessagesProps) {
  const end = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  // biome-ignore lint/correctness/useExhaustiveDependencies: the dependencies are the triggers — a new message, a growing last one, the loading marker
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length, last, loading]);

  if (messages.length === 0 && !loading && empty != null) {
    return <div className="p-4 text-sm text-[var(--react-chat-muted,#6b7280)]">{empty}</div>;
  }
  return (
    <div className="flex w-full flex-col gap-3 p-3">
      {messages.map((message) => {
        if (message.kind === 'item') {
          return (
            <div key={message.id} className="pr-7">
              <ItemMessage message={message} onOpen={onOpenItem} />
            </div>
          );
        }
        if (message.kind === 'card') {
          const variant = message.variant ? ` react-chat__card--${message.variant}` : '';
          return (
            <div
              key={message.id}
              className={`react-chat__card${variant} mr-7 rounded-lg border border-[var(--react-chat-card-border,#fcd34d)] bg-[var(--react-chat-card-bg,#fffbeb)] px-4 py-3 text-sm text-[var(--react-chat-text,#111827)]`}
            >
              {message.content}
            </div>
          );
        }
        const mine = message.kind === 'user';
        return (
          <div key={message.id} className={`flex flex-col gap-1 ${mine ? 'items-end pl-7' : 'items-start pr-7'}`}>
            <div
              className={
                mine
                  ? 'max-w-full rounded-2xl border border-[var(--react-chat-border,#d1d5db)] bg-[var(--react-chat-user-bg,#f0fdf4)] px-4 py-2 text-sm text-[var(--react-chat-text,#111827)]'
                  : 'max-w-full rounded-2xl border border-[var(--react-chat-border,#d1d5db)] bg-[var(--react-chat-assistant-bg,#eff6ff)] px-4 py-2 text-sm text-[var(--react-chat-text,#111827)]'
              }
            >
              {message.content}
              {message.kind === 'assistant' && message.streaming && (
                <span className="ml-1 animate-pulse text-[var(--react-chat-muted,#9ca3af)]">▍</span>
              )}
            </div>
            {message.actions != null && <div className="flex flex-row gap-2">{message.actions}</div>}
          </div>
        );
      })}
      {loading && (
        <div className="pr-7">
          <span className="animate-pulse text-sm text-[var(--react-chat-muted,#9ca3af)]">…</span>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
