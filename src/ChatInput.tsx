import { type ChatStyling, cls } from './classes.js';

export interface ChatInputProps extends ChatStyling {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Given while something runs: the button stops it instead of sending. */
  onStop?: () => void;
  /** A stop was asked for and has not landed yet. */
  stopping?: boolean;
}

/**
 * Enter sends, Shift+Enter is a new line. Nothing is sent while `disabled` or blank;
 * with `onStop`, the button is Stop while `disabled`.
 */
export function ChatInput({
  prompt,
  onPromptChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask a question…',
  onStop,
  stopping = false,
  ...styling
}: ChatInputProps) {
  const canSend = !disabled && prompt.trim() !== '';
  return (
    <div className={cls(styling, 'input', 'react-chat__input')}>
      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        rows={3}
        placeholder={placeholder}
        className={cls(styling, 'textarea', 'react-chat__textarea')}
      />
      {disabled && onStop ? (
        <button
          type="button"
          onClick={onStop}
          disabled={stopping}
          className={cls(styling, ['button', 'stopButton'], 'react-chat__button', 'react-chat__button--stop')}
        >
          {stopping ? 'Stopping…' : 'Stop'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          className={cls(styling, ['button', 'sendButton'], 'react-chat__button', 'react-chat__button--send')}
        >
          Send
        </button>
      )}
    </div>
  );
}
