import { Fragment, type ReactNode, useEffect, useRef } from 'react';
import { type ChatStyling, cls } from './classes.js';
import { ItemMessage } from './ItemMessage.js';
import { type ChatLabels, withDefaults } from './labels.js';
import type { ChatItem, ChatMessage } from './types.js';

export interface ChatMessagesProps extends ChatStyling {
  messages: ChatMessage[];
  /** Shows a waiting marker after the last message (before the first token arrives). */
  loading?: boolean;
  onOpenItem?: (message: ChatItem) => void;
  /** Shown when there are no messages yet. */
  empty?: ReactNode;
  /**
   * Renders one message in place of the package. `defaultRender` gives the
   * package's own row, for a host that only wraps or changes some kinds.
   */
  renderMessage?: (message: ChatMessage, defaultRender: (message: ChatMessage) => ReactNode) => ReactNode;
  /** The strings it shows, over the English defaults. */
  labels?: Partial<ChatLabels>;
}

/** The thread, oldest first, scrolled to its end as it grows. */
export function ChatMessages({
  messages,
  loading = false,
  onOpenItem,
  empty,
  renderMessage,
  labels,
  ...styling
}: ChatMessagesProps) {
  const end = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];
  // biome-ignore lint/correctness/useExhaustiveDependencies: the dependencies are the triggers — a new message, a growing last one, the loading marker
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' });
  }, [messages.length, last, loading]);

  if (messages.length === 0 && !loading && empty != null) {
    return <div className={cls(styling, 'empty', 'react-chat__empty')}>{empty}</div>;
  }

  const row = (kind: string) => cls(styling, 'row', 'react-chat__row', `react-chat__row--${kind}`);
  const defaultRender = (message: ChatMessage): ReactNode => {
    if (message.kind === 'item') {
      return (
        <div className={row('item')} data-kind="item">
          <ItemMessage message={message} onOpen={onOpenItem} {...styling} />
        </div>
      );
    }
    if (message.kind === 'card') {
      return (
        <div className={row('card')} data-kind="card">
          <div
            data-variant={message.variant}
            className={cls(
              styling,
              'card',
              'react-chat__card',
              message.variant && `react-chat__card--${message.variant}`,
            )}
          >
            {message.content}
          </div>
        </div>
      );
    }
    const kind = message.kind;
    return (
      <div className={row(kind)} data-kind={kind}>
        <div
          className={cls(
            styling,
            ['message', kind === 'user' ? 'userMessage' : 'assistantMessage'],
            'react-chat__message',
            `react-chat__message--${kind}`,
          )}
        >
          {message.content}
          {message.kind === 'assistant' && message.streaming && (
            <span aria-hidden="true" className={cls(styling, 'cursor', 'react-chat__cursor')}>
              ▍
            </span>
          )}
        </div>
        {message.actions != null && (
          <div className={cls(styling, 'actions', 'react-chat__actions')}>{message.actions}</div>
        )}
      </div>
    );
  };

  return (
    <div className={cls(styling, 'thread', 'react-chat__thread')}>
      {messages.map((message) => (
        <Fragment key={message.id}>
          {renderMessage ? renderMessage(message, defaultRender) : defaultRender(message)}
        </Fragment>
      ))}
      {loading && (
        <div className={row('loading')} data-kind="loading">
          <span className={cls(styling, 'loading', 'react-chat__loading')}>{withDefaults(labels).loading}</span>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
