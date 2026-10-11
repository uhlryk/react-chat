import type { ChatItem, ItemTone } from './types.js';

// Static strings so a Tailwind scan of this package finds every class.
const TONE_CLASS: Record<ItemTone, string> = {
  neutral: 'text-[var(--react-chat-tone-neutral,#4b5563)]',
  progress: 'text-[var(--react-chat-tone-progress,#b45309)]',
  ok: 'text-[var(--react-chat-tone-ok,#047857)]',
  warn: 'text-[var(--react-chat-tone-warn,#b45309)]',
  bad: 'text-[var(--react-chat-tone-bad,#b91c1c)]',
};

interface ItemMessageProps {
  message: ChatItem;
  onOpen?: (message: ChatItem) => void;
}

/** One line in the thread, in a colour of its own; a click asks the host to open it. */
export function ItemMessage({ message, onOpen }: ItemMessageProps) {
  const variant = message.variant ? ` react-chat__item--${message.variant}` : '';
  return (
    <button
      type="button"
      onClick={onOpen ? () => onOpen(message) : undefined}
      disabled={!onOpen}
      className={`react-chat__item${variant} flex w-full flex-row items-baseline gap-2 rounded-md border border-[var(--react-chat-item-border,#ddd6fe)] bg-[var(--react-chat-item-bg,#f5f3ff)] px-3 py-1.5 text-left font-mono text-xs text-[var(--react-chat-item-text,#4c1d95)] enabled:hover:brightness-110`}
    >
      {message.icon != null && <span aria-hidden="true">{message.icon}</span>}
      <span className="min-w-0 flex-1 truncate">{message.label}</span>
      {message.status != null && (
        <span className={TONE_CLASS[message.status.tone ?? 'neutral']}>{message.status.text}</span>
      )}
      {message.summary != null && (
        <span className="max-w-[40%] truncate text-[var(--react-chat-muted,#4b5563)]">{message.summary}</span>
      )}
    </button>
  );
}
