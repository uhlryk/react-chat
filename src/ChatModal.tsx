import { type ReactNode, useEffect, useId, useRef } from 'react';
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

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable=""], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * A modal over the page; Escape or the backdrop closes it. The consumer renders
 * what is inside. While open, Tab stays inside it; on close, focus goes back to
 * whatever had it before.
 */
export function ChatModal({ open, title, onClose, children, labels, ...styling }: ChatModalProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // the latest onClose, so a host's inline callback does not re-run the focus effect
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close.current();
        return;
      }
      const box = dialog.current;
      if (event.key !== 'Tab' || box == null) return;
      const focusable = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) {
        event.preventDefault();
        box.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && box.contains(active);
      if (event.shiftKey && (!inside || active === first || active === box)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop's click is a mouse shortcut; Escape closes it from the keyboard
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape is handled on window, above
    <div className={cls(styling, 'backdrop', 'react-chat__backdrop')} onClick={onClose}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: only stops the backdrop's click; keys are the dialog's content's */}
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cls(styling, 'modal', 'react-chat__modal')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={cls(styling, 'modalHeader', 'react-chat__modal-header')}>
          <div id={titleId} className={cls(styling, 'modalTitle', 'react-chat__modal-title')}>
            {title}
          </div>
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
