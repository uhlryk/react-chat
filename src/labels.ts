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
}

export const defaultChatLabels: Readonly<ChatLabels> = {
  send: 'Send',
  stop: 'Stop',
  stopping: 'Stopping…',
  placeholder: 'Ask a question…',
  close: 'Close',
  loading: '…',
};

/** The host's labels over the English defaults. */
export function withDefaults(labels: Partial<ChatLabels> | undefined): ChatLabels {
  return { ...defaultChatLabels, ...labels };
}
