import { type ReactNode, useEffect } from 'react';

interface ChatModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/** A modal over the page; Escape or the backdrop closes it. The consumer renders what is inside. */
export function ChatModal({ open, title, onClose, children }: ChatModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop's click is a mouse shortcut; Escape closes it from the keyboard
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled on window, above
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only stops the backdrop's click; keys are the dialog's content's */}
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-[var(--react-chat-border,#e5e7eb)] bg-[var(--react-chat-surface,#ffffff)] text-[var(--react-chat-text,#111827)] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-row items-center justify-between border-b border-[var(--react-chat-border,#e5e7eb)] px-4 py-2">
          <div className="text-sm font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 text-[var(--react-chat-muted,#6b7280)] hover:opacity-80"
          >
            ✕
          </button>
        </div>
        <div className="overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
