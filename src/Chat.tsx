import type { ReactNode } from 'react';
import { ChatInput } from './ChatInput.js';
import { ChatMessages } from './ChatMessages.js';
import type { ChatMessage } from './types.js';

interface ChatProps {
  messages: ChatMessage[];
  loading?: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  /** Disables sending (a reply in flight). */
  busy?: boolean;
  onOpenTool?: (message: Extract<ChatMessage, { kind: 'tool' }>) => void;
  empty?: ReactNode;
  placeholder?: string;
  /** Stops what runs while `busy` — the input's button becomes Stop. */
  onStop?: () => void;
  stopping?: boolean;
}

/** The thread above, the input below, in whatever box the consumer gives it. */
export function Chat({
  messages,
  loading,
  prompt,
  onPromptChange,
  onSubmit,
  busy,
  onOpenTool,
  empty,
  placeholder,
  onStop,
  stopping,
}: ChatProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessages messages={messages} loading={loading} onOpenTool={onOpenTool} empty={empty} />
      </div>
      <ChatInput
        prompt={prompt}
        onPromptChange={onPromptChange}
        onSubmit={onSubmit}
        disabled={busy}
        placeholder={placeholder}
        onStop={onStop}
        stopping={stopping}
      />
    </div>
  );
}
