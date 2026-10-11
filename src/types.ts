import type { ReactNode } from 'react';

/** How an item's status reads: the package colours it, the host names it. */
export type ItemTone = 'neutral' | 'progress' | 'ok' | 'warn' | 'bad';

/**
 * One message of the thread. `user` and `assistant` are the bubbles and carry any
 * node: text, markdown the host rendered, a chart. An `item` is one line in the
 * thread (anything the host wants listed: a call, a file, a step) and asks the
 * host to open it on click. A `card` is a highlighted block whose body is the
 * host's. The package keeps no conversation: the host passes the whole list on
 * every render.
 */
export type ChatMessage =
  | { id: string; kind: 'user'; content: ReactNode; actions?: ReactNode }
  | {
      id: string;
      kind: 'assistant';
      content: ReactNode;
      /** True while the reply is still arriving. */
      streaming?: boolean;
      actions?: ReactNode;
    }
  | {
      id: string;
      kind: 'item';
      /** What it is, in a line. */
      label: ReactNode;
      /** Where it stands, in the host's words; `tone` picks the colour (default `neutral`). */
      status?: { text: ReactNode; tone?: ItemTone };
      /** A short tail after the status. */
      summary?: ReactNode;
      /** Any name of the host's, rendered as the class `react-chat__item--{variant}`. */
      variant?: string;
      icon?: ReactNode;
    }
  | {
      id: string;
      kind: 'card';
      content: ReactNode;
      /** Any name of the host's, rendered as the class `react-chat__card--{variant}`. */
      variant?: string;
    };

export type ChatItem = Extract<ChatMessage, { kind: 'item' }>;
