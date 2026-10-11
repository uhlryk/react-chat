import type { ReactNode } from 'react';

/** Where a tool message is: in flight, or how it ended. */
export type ToolState = 'running' | 'done' | 'refused' | 'cut' | 'error' | 'stopped';

/**
 * One message of the thread. `user` and `assistant` carry content (any node: text,
 * markdown rendered by the consumer, a chart). A `tool` message is one line in the
 * thread — what was called and its state — and opens a details modal on click; the
 * modal's content is the consumer's.
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
      /**
       * Something the model PROPOSES that only the person can make happen (an
       * action card): its body — what it would do, the buttons, the outcome — is
       * the consumer's; the package gives it its own colour in the thread.
       */
      kind: 'action';
      content: ReactNode;
    }
  | {
      id: string;
      kind: 'tool';
      /** What was called, in a line: tool, operation, the key arguments. */
      label: ReactNode;
      state: ToolState;
      /** A short tail after the state: a refusal's reason, a size. */
      summary?: ReactNode;
      /**
       * `nested`: a call made on behalf of another call (a sub-agent's), shown in
       * a colour of its own so the two layers read apart. Default: `main`.
       */
      layer?: 'main' | 'nested';
    };
