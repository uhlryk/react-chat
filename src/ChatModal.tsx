import { type ReactNode, useEffect } from 'react';
import { type ChatStyling, cls } from './classes.js';
import { type ChatLabels, withDefaults } from './labels.js';

export interface ChatModalProps extends ChatStyling {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** The strings it announces, over the English defaults. */
  labels?: Partial<ChatLabels>;
}

/** A modal over the page; Escape or the backdrop closes it. The consumer renders what is inside. */
export function ChatModal({ open, title, onClose, children, labels, ...styling }: ChatModalProps) {
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
    <div className={cls(styling, 'backdrop', 'react-chat__backdrop')} onClick={onClose}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only stops the backdrop's click; keys are the dialog's content's */}
      <div
        role="dialog"
        aria-modal="true"
        className={cls(styling, 'modal', 'react-chat__modal')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cls(styling, 'modalHeader', 'react-chat__modal-header')}>
          <div className={cls(styling, 'modalTitle', 'react-chat__modal-title')}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label={withDefaults(labels).close}
            className={cls(styling, 'modalClose', 'react-chat__modal-close')}
          >
            ✕
          </button>
        </div>
        <div className={cls(styling, 'modalBody', 'react-chat__modal-body')}>{children}</div>
      </div>
    </div>
  );
}
