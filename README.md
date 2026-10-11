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

## Styling

The package ships a stylesheet. Import it once; neither the build nor the runtime
needs Tailwind or any other CSS tool:

```ts
import '@krzysztofsztompka/react-chat/styles.css';
```

Every rule sits in `:where()`, so it weighs nothing: one class of yours always
wins. There are three ways in, from lightest to heaviest.

### 1. CSS variables

Set them on any ancestor. The stylesheet only reads them, with a light default.

| variable | what it sets |
|---|---|
| `--react-chat-text`, `--react-chat-muted` | text, secondary text |
| `--react-chat-border`, `--react-chat-surface`, `--react-chat-input-bg` | lines, the input bar, the text area |
| `--react-chat-user-bg`, `--react-chat-assistant-bg` | the two bubbles |
| `--react-chat-item-bg`, `-item-border`, `-item-text` | an item line |
| `--react-chat-card-bg`, `-card-border` | a card |
| `--react-chat-accent`, `-accent-text` | the Send button, the focus border |
| `--react-chat-tone-neutral`, `-progress`, `-ok`, `-warn`, `-bad` | an item's status (`-bad` also colours Stop) |
| `--react-chat-placeholder`, `--react-chat-backdrop` | the placeholder text, the modal's backdrop |
| `--react-chat-font-size`, `--react-chat-line-height`, `--react-chat-font-mono` | text size, line height, the item lines' font |
| `--react-chat-gap`, `--react-chat-padding`, `--react-chat-indent` | space between messages, around the thread and the input, the side left free opposite a message |
| `--react-chat-radius`, `-bubble-radius`, `-item-radius`, `-button-radius` | corners: cards, the text area and the modal; bubbles; item lines; buttons |
| `--react-chat-modal-width`, `--react-chat-modal-z` | the modal's maximum width, its z-index |

A dark theme is just these variables under your own dark selector:

```css
.dark {
  --react-chat-text: #f3f4f6;
  --react-chat-border: #374151;
  --react-chat-surface: #111827;
  --react-chat-assistant-bg: #1e3a8a;
  /* … */
}
```

An item or a card with a `variant` also gets the class `react-chat__item--{variant}`
or `react-chat__card--{variant}`, plus `data-variant`. Set the variables there to
give a variant its own colours:

```css
.react-chat__item--nested {
  --react-chat-item-bg: #eff6ff;
  --react-chat-item-border: #bfdbfe;
  --react-chat-item-text: #1e3a8a;
}
```

### 2. `classNames`

Every component takes `classNames`, one class per part, appended to the default.
It works with any class-based tool, for example Tailwind or CSS modules:

```tsx
<Chat {...props} classNames={{ userMessage: 'my-bubble', sendButton: 'my-send' }} />
```

The parts are `root`, `viewport`, `thread`, `empty`, `row`, `message`,
`userMessage`, `assistantMessage`, `cursor`, `actions`, `loading`, `item`,
`itemIcon`, `itemLabel`, `itemStatus`, `itemSummary`, `card`, `input`,
`textarea`, `button`, `sendButton`, `stopButton`, and for `ChatModal`:
`backdrop`, `modal`, `modalHeader`, `modalTitle`, `modalClose`, `modalBody`.

### 3. Render overrides

`renderMessage(message, defaultRender)` renders a message in place of the
package. Call `defaultRender(message)` for the kinds you do not change.
`renderInput(props)` replaces the input and gets what `ChatInput` would get.

```tsx
<Chat
  {...props}
  renderMessage={(m, defaultRender) => (m.kind === 'card' ? <MyCard>{m.content}</MyCard> : defaultRender(m))}
  renderInput={(p) => <MyComposer value={p.prompt} onChange={p.onPromptChange} onSend={p.onSubmit} />}
/>
```

### `unstyled`

`unstyled` drops every default class, so only your `classNames` remain. Rows,
statuses and variants keep `data-kind`, `data-tone` and `data-variant` for you to
style by. Leave the stylesheet out in that case.

[`example/`](example/) is a page with no build step and no Tailwind. It shows a
light and a dark thread: run `npm run build && npx http-server .` and open
`/example/`.

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
| `Chat` | `messages`, `prompt`, `onPromptChange`, `onSubmit`; optional `busy` (no sending), `onStop` + `stopping` (the button becomes Stop while busy), `loading` (a waiting marker after the last message), `onOpenItem`, `empty` (shown with no messages), `placeholder`, `renderMessage`, `renderInput` |
| `ChatMessages` | the thread alone: `messages`, `loading`, `onOpenItem`, `empty`, `renderMessage` |
| `ChatInput` | the input alone: `prompt`, `onPromptChange`, `onSubmit`, `disabled`, `placeholder`, `onStop`, `stopping`. Enter sends, Shift+Enter is a new line |
| `ItemMessage` | one item line: `message`, `onOpen` |
| `ChatModal` | a modal shell for an opened item: `open`, `title`, `onClose`, `children`. Escape or the backdrop closes it |

Every component also takes `classNames` and `unstyled`. The props types are
exported (`ChatProps`, `ChatInputProps`, …), as are `ChatClassNames` and `ChatPart`.

## License

MIT
