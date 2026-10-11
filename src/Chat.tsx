import type { ReactNode } from 'react';
import { ChatInput } from './ChatInput.js';
import { ChatMessages } from './ChatMessages.js';
import type { ChatItem, ChatMessage } from './types.js';

interface ChatProps {
  messages: ChatMessage[];
  loading?: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  /** Disables sending (a reply in flight). */
  busy?: boolean;
  onOpenItem?: (message: ChatItem) => void;
  empty?: ReactNode;
  placeholder?: string;
  /** Stops what runs while `busy` — the input's button becomes Stop. */
  onStop?: () => void;
  stopping?: boolean;
}

/** The thread above, the input below, in whatever box the host gives it. */
export function Chat({
  messages,
  loading,
  prompt,
  onPromptChange,
  onSubmit,
  busy,
  onOpenItem,
  empty,
  placeholder,
  onStop,
  stopping,
}: ChatProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatMessages messages={messages} loading={loading} onOpenItem={onOpenItem} empty={empty} />
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
