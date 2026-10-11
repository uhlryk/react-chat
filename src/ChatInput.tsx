interface ChatInputProps {
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
}: ChatInputProps) {
  const canSend = !disabled && prompt.trim() !== '';
  return (
    <div className="flex flex-row items-end gap-2 border-t border-[var(--react-chat-border,#d1d5db)] bg-[var(--react-chat-surface,#ffffff)] p-3">
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
        className="block w-full resize-y rounded-lg border border-[var(--react-chat-border,#d1d5db)] bg-[var(--react-chat-input-bg,#f9fafb)] p-2.5 text-sm text-[var(--react-chat-text,#111827)] focus:border-[var(--react-chat-accent,#2563eb)] focus:outline-none"
      />
      {disabled && onStop ? (
        <button
          type="button"
          onClick={onStop}
          disabled={stopping}
          className="rounded border border-[var(--react-chat-tone-bad,#b91c1c)] px-4 py-2 text-sm text-[var(--react-chat-tone-bad,#b91c1c)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stopping ? 'Stopping…' : 'Stop'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          className="rounded bg-[var(--react-chat-accent,#2563eb)] px-4 py-2 text-sm text-[var(--react-chat-accent-text,#ffffff)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      )}
    </div>
  );
}
