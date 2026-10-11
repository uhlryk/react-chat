/** A part of the thread a host can add its own class to. */
export type ChatPart =
  | 'root'
  | 'viewport'
  | 'thread'
  | 'empty'
  | 'row'
  | 'message'
  | 'userMessage'
  | 'assistantMessage'
  | 'cursor'
  | 'actions'
  | 'loading'
  | 'item'
  | 'itemIcon'
  | 'itemLabel'
  | 'itemStatus'
  | 'itemSummary'
  | 'card'
  | 'input'
  | 'textarea'
  | 'button'
  | 'sendButton'
  | 'stopButton'
  | 'backdrop'
  | 'modal'
  | 'modalHeader'
  | 'modalTitle'
  | 'modalClose'
  | 'modalBody';

/** The host's class for each part, appended to the default one. */
export type ChatClassNames = Partial<Record<ChatPart, string>>;

/** What every component takes to be styled by the host. */
export interface ChatStyling {
  /** One class per part, appended to the default. */
  classNames?: ChatClassNames;
  /** No default classes at all; only the host's `classNames` remain. */
  unstyled?: boolean;
}

/** The class of a part: the defaults (unless `unstyled`), then the host's for each named part. */
export function cls(
  { classNames, unstyled }: ChatStyling,
  parts: ChatPart | ChatPart[],
  ...defaults: (string | false | undefined)[]
): string | undefined {
  const names = unstyled ? [] : defaults.filter(Boolean);
  for (const part of Array.isArray(parts) ? parts : [parts]) {
    const extra = classNames?.[part];
    if (extra) names.push(extra);
  }
  return names.length > 0 ? names.join(' ') : undefined;
}
