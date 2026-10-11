import type { ReactNode } from 'react';
import { ChatInput, type ChatInputProps } from './ChatInput.js';
import { ChatMessages, type ChatMessagesProps } from './ChatMessages.js';
import { type ChatStyling, cls } from './classes.js';
import type { ChatItem, ChatMessage } from './types.js';

export interface ChatProps extends ChatStyling {
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
  /** Renders one message in place of the package; see `ChatMessages`. */
  renderMessage?: ChatMessagesProps['renderMessage'];
  /** Renders the input in place of the package, given what `ChatInput` would get. */
  renderInput?: (props: ChatInputProps) => ReactNode;
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
  renderMessage,
  renderInput,
  ...styling
}: ChatProps) {
  const input: ChatInputProps = {
    prompt,
    onPromptChange,
    onSubmit,
    disabled: busy,
    placeholder,
    onStop,
    stopping,
    ...styling,
  };
  return (
    <div className={cls(styling, 'root', 'react-chat')}>
      <div className={cls(styling, 'viewport', 'react-chat__viewport')}>
        <ChatMessages
          messages={messages}
          loading={loading}
          onOpenItem={onOpenItem}
          empty={empty}
          renderMessage={renderMessage}
          {...styling}
        />
      </div>
      {renderInput ? renderInput(input) : <ChatInput {...input} />}
    </div>
  );
}
