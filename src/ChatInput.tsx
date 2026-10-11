'use client';

import { useState } from 'react';
import { type ChatStyling, cls } from './classes.js';
import { type ChatLabels, withDefaults } from './labels.js';

export interface ChatInputProps extends ChatStyling {
  /** The text, when the host holds it (controlled); leave it out to let the input hold it. */
  prompt?: string;
  /** Every change of the text; with `prompt`, the host stores it. */
  onPromptChange?: (value: string) => void;
  /** The text the input starts with when it holds the text itself. */
  defaultValue?: string;
  /** The person sends `text`. An input that holds its own text empties itself after. */
  onSubmit: (text: string) => void;
  disabled?: boolean;
  /** Given while something runs: the button stops it instead of sending. */
  onStop?: () => void;
  /** A stop was asked for and has not landed yet. */
  stopping?: boolean;
  /** The strings it shows, over the English defaults. */
  labels?: Partial<ChatLabels>;
}

/**
 * Enter sends, Shift+Enter is a new line. Nothing is sent while `disabled` or blank;
 * with `onStop`, the button is Stop while `disabled`. Controlled with `prompt`,
 * uncontrolled without it.
 */
export function ChatInput({
  prompt,
  onPromptChange,
  defaultValue = '',
  onSubmit,
  disabled = false,
  onStop,
  stopping = false,
  labels,
  ...styling
}: ChatInputProps) {
  const text = withDefaults(labels);
  const [own, setOwn] = useState(defaultValue);
  const controlled = prompt !== undefined;
  const value = controlled ? prompt : own;
  const canSend = !disabled && value.trim() !== '';
  const send = () => {
    if (!canSend) return;
    onSubmit(value);
    if (!controlled) setOwn('');
  };
  return (
    <div className={cls(styling, 'input', 'react-chat__input')}>
      <textarea
        value={value}
        onChange={(event) => {
          if (!controlled) setOwn(event.target.value);
          onPromptChange?.(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
        rows={3}
        placeholder={text.placeholder}
        className={cls(styling, 'textarea', 'react-chat__textarea')}
      />
      {disabled && onStop ? (
        <button
          type="button"
          onClick={onStop}
          disabled={stopping}
          className={cls(styling, ['button', 'stopButton'], 'react-chat__button', 'react-chat__button--stop')}
        >
          {stopping ? text.stopping : text.stop}
        </button>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className={cls(styling, ['button', 'sendButton'], 'react-chat__button', 'react-chat__button--send')}
        >
          {text.send}
        </button>
      )}
    </div>
  );
}
