import { useId } from 'react';
import { type ChatStyling, cls } from './classes.js';
import type { ChatItem } from './types.js';

export interface ItemMessageProps extends ChatStyling {
  message: ChatItem;
  onOpen?: (message: ChatItem) => void;
}

/**
 * One line in the thread, in a colour of its own; a click asks the host to open it.
 * Its accessible name reads label, status and summary as separate words.
 */
export function ItemMessage({ message, onOpen, ...styling }: ItemMessageProps) {
  const tone = message.status?.tone ?? 'neutral';
  const id = useId();
  const named = [`${id}l`, message.status != null && `${id}s`, message.summary != null && `${id}m`];
  return (
    <button
      type="button"
      onClick={onOpen ? () => onOpen(message) : undefined}
      disabled={!onOpen}
      data-variant={message.variant}
      aria-labelledby={named.filter(Boolean).join(' ')}
      className={cls(styling, 'item', 'react-chat__item', message.variant && `react-chat__item--${message.variant}`)}
    >
      {message.icon != null && (
        <span aria-hidden="true" className={cls(styling, 'itemIcon', 'react-chat__item-icon')}>
          {message.icon}
        </span>
      )}
      <span id={`${id}l`} className={cls(styling, 'itemLabel', 'react-chat__item-label')}>
        {message.label}
      </span>
      {message.status != null && (
        <span
          id={`${id}s`}
          data-tone={tone}
          className={cls(styling, 'itemStatus', 'react-chat__item-status', `react-chat__item-status--${tone}`)}
        >
          {message.status.text}
        </span>
      )}
      {message.summary != null && (
        <span id={`${id}m`} className={cls(styling, 'itemSummary', 'react-chat__item-summary')}>
          {message.summary}
        </span>
      )}
    </button>
  );
}
