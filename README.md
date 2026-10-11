# @krzysztofsztompka/react-chat

A chat thread for React: the questions, the answers, item lines and cards, and an
input. It keeps **no conversation** and knows **no transport**. You hold the
messages in whatever store you have (React state, Redux, Zustand, a server cache)
and pass the whole list on every render. The component tells you what the person
did (`onSubmit`, `onStop`, `onOpenItem`), and you decide what happens.

```sh
npm install @krzysztofsztompka/react-chat
```

React 18.3+ or 19 is a peer dependency. ES modules and CommonJS are both shipped,
with types.

## Styling (0.x)

The components carry [Tailwind CSS v4](https://tailwindcss.com) class names. Add the
package to your Tailwind sources:

```css
@import 'tailwindcss';
@source '../node_modules/@krzysztofsztompka/react-chat/dist/esm';
```

A prebuilt stylesheet that does not need Tailwind is planned for a later 0.x release.

Every colour is a CSS variable with a light default. Set them on any wrapper:

| variable | what it colours |
|---|---|
| `--react-chat-text`, `--react-chat-muted` | text, secondary text |
| `--react-chat-border`, `--react-chat-surface`, `--react-chat-input-bg` | lines, the input bar, the text area |
| `--react-chat-user-bg`, `--react-chat-assistant-bg` | the two bubbles |
| `--react-chat-item-bg`, `-item-border`, `-item-text` | an item line |
| `--react-chat-card-bg`, `-card-border` | a card |
| `--react-chat-accent`, `-accent-text` | the Send button, the focus ring |
| `--react-chat-tone-neutral`, `-progress`, `-ok`, `-warn`, `-bad` | an item's status (`-bad` also colours Stop) |

An item and a card with a `variant` also get the class `react-chat__item--{variant}` /
`react-chat__card--{variant}`. Set the variables on that class to give a variant its
own colours:

```css
.react-chat__item--nested {
  --react-chat-item-bg: #eff6ff;
  --react-chat-item-border: #bfdbfe;
  --react-chat-item-text: #1e3a8a;
}
```

## Use

```tsx
import { Chat, type ChatMessage } from '@krzysztofsztompka/react-chat';

function Support() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    const question = prompt;
    setPrompt('');
    setBusy(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: 'user', content: question }]);
    const answer = await ask(question); // your transport
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: 'assistant', content: answer }]);
    setBusy(false);
  }

  return (
    <div style={{ height: 600 }}>
      <Chat messages={messages} prompt={prompt} onPromptChange={setPrompt} onSubmit={send} busy={busy} />
    </div>
  );
}
```

`Chat` fills the box you give it: the thread scrolls, the input stays at the bottom.
To stream an answer, keep replacing the same `assistant` message with
`streaming: true` and drop the flag when it is complete.

## Messages

```ts
type ChatMessage =
  | { id; kind: 'user'; content: ReactNode; actions?: ReactNode }
  | { id; kind: 'assistant'; content: ReactNode; streaming?: boolean; actions?: ReactNode }
  | { id; kind: 'item'; label: ReactNode; status?: { text: ReactNode; tone?: ItemTone };
      summary?: ReactNode; variant?: string; icon?: ReactNode }
  | { id; kind: 'card'; content: ReactNode; variant?: string };

type ItemTone = 'neutral' | 'progress' | 'ok' | 'warn' | 'bad';
```

- **`user` / `assistant`** are bubbles. `content` is any node: plain text, markdown
  you rendered, a chart. `actions` is a row of buttons under the bubble.
- **`item`** is one line in the thread for anything you want listed: a call, a
  file, a step. `status.text` is in your words, and `tone` picks its colour. A
  click calls `onOpenItem(item)`; without `onOpenItem` the line is inert.
- **`card`** is a highlighted block whose body is yours, for example a proposal
  with its own buttons.

## Components

| component | props |
|---|---|
| `Chat` | `messages`, `prompt`, `onPromptChange`, `onSubmit`; optional `busy` (no sending), `onStop` + `stopping` (the button becomes Stop while busy), `loading` (a waiting marker after the last message), `onOpenItem`, `empty` (shown with no messages), `placeholder` |
| `ChatMessages` | the thread alone: `messages`, `loading`, `onOpenItem`, `empty` |
| `ChatInput` | the input alone: `prompt`, `onPromptChange`, `onSubmit`, `disabled`, `placeholder`, `onStop`, `stopping`. Enter sends, Shift+Enter is a new line |
| `ItemMessage` | one item line: `message`, `onOpen` |
| `ChatModal` | a modal shell for an opened item: `open`, `title`, `onClose`, `children`. Escape or the backdrop closes it |

## License

MIT
