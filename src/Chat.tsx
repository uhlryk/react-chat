import type { ReactNode } from 'react';
import { ChatInput, type ChatInputProps } from './ChatInput.js';
import { ChatMessages, type ChatMessagesProps } from './ChatMessages.js';
import { type ChatStyling, cls } from './classes.js';
import type { ChatLabels } from './labels.js';
import type { ChatItem, ChatMessage } from './types.js';

export interface ChatProps extends ChatStyling {
  messages: ChatMessage[];
  loading?: boolean;
  /** The input's text when the host holds it; leave it out for an input that holds its own. */
  prompt?: string;
  onPromptChange?: (value: string) => void;
  /** The text an input that holds its own starts with. */
  defaultValue?: string;
  /** The person sends `text`. */
  onSubmit: (text: string) => void;
  /** Disables sending (a reply in flight). */
  busy?: boolean;
  onOpenItem?: (message: ChatItem) => void;
  empty?: ReactNode;
  /** Stops what runs while `busy` — the input's button becomes Stop. */
  onStop?: () => void;
  stopping?: boolean;
  /** Renders one message in place of the package; see `ChatMessages`. */
  renderMessage?: ChatMessagesProps['renderMessage'];
  /** Renders the input in place of the package, given what `ChatInput` would get. */
  renderInput?: (props: ChatInputProps) => ReactNode;
  /** Every string the thread shows, over the English defaults; passed down to the thread and the input. */
  labels?: Partial<ChatLabels>;
}

/** The thread above, the input below, in whatever box the host gives it. */
export function Chat({
  messages,
  loading,
  prompt,
  onPromptChange,
  defaultValue,
  onSubmit,
  busy,
  onOpenItem,
  empty,
  onStop,
  stopping,
  renderMessage,
  renderInput,
  labels,
  ...styling
}: ChatProps) {
  const input: ChatInputProps = {
    prompt,
    onPromptChange,
    defaultValue,
    onSubmit,
    disabled: busy,
    onStop,
    stopping,
    labels,
    ...styling,
  };
  return (
    <div className={cls(styling, 'root', 'react-chat')}>
      <ChatMessages
        messages={messages}
        loading={loading}
        onOpenItem={onOpenItem}
        empty={empty}
        renderMessage={renderMessage}
        labels={labels}
        {...styling}
      />
      {renderInput ? renderInput(input) : <ChatInput {...input} />}
    </div>
  );
}
