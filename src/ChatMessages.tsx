'use client';

import { Fragment, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

// Layout effects scroll before the paint; on a server there is nothing to scroll.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** How close to the end, in pixels, still counts as reading the newest message. */
const NEAR_END = 32;

/**
 * The thread, oldest first, in a box of its own that scrolls. It follows the
 * end as the thread grows while the reader is there; once they scroll up it
 * stays put and offers a way back. The person's own new message brings them
 * back down.
 */
export function ChatMessages({
  messages,
  loading = false,
  onOpenItem,
  empty,
  renderMessage,
  labels,
  ...styling
}: ChatMessagesProps) {
  const text = withDefaults(labels);
  const viewport = useRef<HTMLDivElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  // whether to follow the end, kept in a ref so following needs no render
  const following = useRef(true);
  const [atEnd, setAtEnd] = useState(true);
  const newest = useRef<string | undefined>(undefined);
  const last = messages[messages.length - 1];

  const toEnd = () => {
    const box = viewport.current;
    if (box) box.scrollTop = box.scrollHeight;
  };

  useIsomorphicLayoutEffect(() => {
    if (last != null && last.id !== newest.current) {
      newest.current = last.id;
      if (last.kind === 'user') {
        following.current = true;
        setAtEnd(true);
      }
    }
    if (following.current) toEnd();
  }, [messages.length, last, loading]);

  // content that grows by itself (an image loading, a chart drawing) is followed too
  // biome-ignore lint/correctness/useExhaustiveDependencies: toEnd only reads refs
  useEffect(() => {
    const content = thread.current;
    if (content == null || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (following.current) toEnd();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const box = viewport.current;
    if (box == null) return;
    const end = box.scrollHeight - box.scrollTop - box.clientHeight <= NEAR_END;
    following.current = end;
    setAtEnd(end);
  };

  const showEmpty = messages.length === 0 && !loading && empty != null;
  // a reply still arriving is announced once, when it is complete
  const busy = loading || messages.some((message) => message.kind === 'assistant' && message.streaming);

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
    <div className={cls(styling, 'messages', 'react-chat__messages')}>
      <div ref={viewport} onScroll={onScroll} className={cls(styling, 'viewport', 'react-chat__viewport')}>
        {showEmpty && <div className={cls(styling, 'empty', 'react-chat__empty')}>{empty}</div>}
        <div
          ref={thread}
          role="log"
          aria-live="polite"
          aria-busy={busy || undefined}
          className={cls(styling, 'thread', 'react-chat__thread')}
        >
          {messages.map((message) => (
            <Fragment key={message.id}>
              {renderMessage ? renderMessage(message, defaultRender) : defaultRender(message)}
            </Fragment>
          ))}
          {loading && (
            <div className={row('loading')} data-kind="loading">
              <span className={cls(styling, 'loading', 'react-chat__loading')}>{text.loading}</span>
            </div>
          )}
        </div>
      </div>
      {!atEnd && messages.length > 0 && (
        <button
          type="button"
          onClick={() => {
            following.current = true;
            setAtEnd(true);
            toEnd();
          }}
          className={cls(styling, 'jumpButton', 'react-chat__jump')}
        >
          {text.jumpToLatest}
        </button>
      )}
    </div>
  );
}
