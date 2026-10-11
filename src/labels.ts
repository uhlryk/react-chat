/** Every string the thread shows or announces. A host in another language replaces them. */
export interface ChatLabels {
  /** The send button. */
  send: string;
  /** The button while something runs and the host can stop it. */
  stop: string;
  /** The stop button after a stop was asked for. */
  stopping: string;
  /** The empty text area. */
  placeholder: string;
  /** The modal's close button, for screen readers. */
  close: string;
  /** The waiting marker after the last message. */
  loading: string;
  /** The control that scrolls back to the newest message, shown once the reader has scrolled up. */
  jumpToLatest: string;
}

export const defaultChatLabels: Readonly<ChatLabels> = {
  send: 'Send',
  stop: 'Stop',
  stopping: 'Stopping…',
  placeholder: 'Ask a question…',
  close: 'Close',
  loading: '…',
  jumpToLatest: 'Jump to latest',
};

/** The host's labels over the English defaults. */
export function withDefaults(labels: Partial<ChatLabels> | undefined): ChatLabels {
  return { ...defaultChatLabels, ...labels };
}
