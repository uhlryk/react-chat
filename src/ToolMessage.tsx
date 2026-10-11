import type { ChatMessage, ToolState } from './types.js';

type ToolChatMessage = Extract<ChatMessage, { kind: 'tool' }>;

// Static strings so a Tailwind scan of this package finds every class.
const STATE_TEXT: Record<ToolState, string> = {
  running: 'running…',
  done: 'done',
  refused: 'refused',
  cut: 'cut',
  error: 'failed',
  stopped: 'stopped',
};
const STATE_CLASS: Record<ToolState, string> = {
  running: 'text-[var(--smi-chat-warn,#b45309)]',
  done: 'text-[var(--smi-chat-ok,#047857)]',
  refused: 'text-[var(--smi-chat-bad,#b91c1c)]',
  cut: 'text-[var(--smi-chat-warn,#b45309)]',
  error: 'text-[var(--smi-chat-bad,#b91c1c)]',
  stopped: 'text-[var(--smi-chat-muted,#4b5563)]',
};

interface ToolMessageProps {
  message: ToolChatMessage;
  onOpen?: (message: ToolChatMessage) => void;
}

// Each layer's colours, static for the same reason; `nested` defaults to blue.
const LAYER_CLASS = {
  main: 'border-[var(--smi-chat-tool-border,#ddd6fe)] bg-[var(--smi-chat-tool-bg,#f5f3ff)] text-[var(--smi-chat-tool-text,#4c1d95)]',
  nested:
    'border-[var(--smi-chat-nested-tool-border,#bfdbfe)] bg-[var(--smi-chat-nested-tool-bg,#eff6ff)] text-[var(--smi-chat-nested-tool-text,#1e3a8a)]',
} as const;

/** One line in the thread, in a colour of its own; a click asks the consumer to open its details. */
export function ToolMessage({ message, onOpen }: ToolMessageProps) {
  return (
    <button
      type="button"
      onClick={onOpen ? () => onOpen(message) : undefined}
      disabled={!onOpen}
      className={`flex w-full flex-row items-baseline gap-2 rounded-md border px-3 py-1.5 text-left font-mono text-xs enabled:hover:brightness-110 ${LAYER_CLASS[message.layer ?? 'main']}`}
    >
      <span aria-hidden="true">⚙</span>
      <span className="min-w-0 flex-1 truncate">{message.label}</span>
      <span className={STATE_CLASS[message.state]}>{STATE_TEXT[message.state]}</span>
      {message.summary != null && (
        <span className="max-w-[40%] truncate text-[var(--smi-chat-muted,#4b5563)]">{message.summary}</span>
      )}
    </button>
  );
}
