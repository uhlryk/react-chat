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
with types. The stylesheet is plain CSS: no Tailwind and no other CSS tool needed.

## Use

```tsx
import '@krzysztofsztompka/react-chat/styles.css';
import { Chat, type ChatMessage } from '@krzysztofsztompka/react-chat';
import { useState } from 'react';

function Support() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);

  async function send(question: string) {
    setBusy(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: 'user', content: question }]);
    const answer = await ask(question); // your transport
    setMessages((m) => [...m, { id: crypto.randomUUID(), kind: 'assistant', content: answer }]);
    setBusy(false);
  }

  return (
    <div style={{ height: 600 }}>
      <Chat messages={messages} onSubmit={send} busy={busy} />
    </div>
  );
}
```

`Chat` fills the box you give it: the thread scrolls, and the input stays at the
bottom.

The input holds its own text here: `onSubmit(text)` gets the text, and the input
empties itself. To hold the text yourself (a draft you keep, text you insert),
pass `prompt` and `onPromptChange`. `onSubmit(text)` then still gets the text, and
clearing it is up to you. `defaultValue` sets the starting text of an input that
holds its own.

### Streaming and stopping

To stream an answer, keep replacing the same `assistant` message, with
`streaming: true` until it is complete. `loading` shows a waiting marker before
the first token. With `onStop`, the Send button becomes Stop while `busy`, and
`stopping` greys it out until your stop lands.

```tsx
const reply = { id, kind: 'assistant', content: textSoFar, streaming: !done } as const;
setMessages((m) => [...m.filter((x) => x.id !== id), reply]);

<Chat
  messages={messages}
  onSubmit={send}
  busy={busy}
  loading={busy && textSoFar === ''}
  onStop={() => abort.abort()}
/>;
```

### Items and the modal

An `item` is a line for anything you want listed in the thread: a call, a file, a
step. A click calls `onOpenItem(item)`, and what opens is up to you. `ChatModal` is
a ready modal shell for it:

```tsx
const [open, setOpen] = useState<ChatItem | null>(null);

<Chat messages={messages} onSubmit={send} onOpenItem={setOpen} />
<ChatModal open={open != null} title={open?.label} onClose={() => setOpen(null)}>
  {open && <Details of={open} />}
</ChatModal>
```

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
- **`item`** is one line in the thread. `status.text` is in your words, and `tone`
  picks its colour. Without `onOpenItem`, the line is inert.
- **`card`** is a highlighted block whose body is yours, for example a proposal
  with its own buttons.

`id` is any string that stays the same for a message across renders.

## Behaviour

- **Scrolling.** The thread follows the newest message while the reader is at the
  end. Once they scroll up, it stays where they are and shows a "Jump to latest"
  button. The person's own new message brings them back down.
- **Screen readers.** The thread is a `role="log"` with `aria-live="polite"`.
  While a reply is still arriving (`streaming`) or `loading`, it is `aria-busy`,
  so the reply is read once it is complete rather than token by token. An item
  line is named by its label, status and summary, as separate words.
- **The keyboard.** Enter sends, and Shift+Enter starts a new line.
- **The modal** moves focus into itself, keeps Tab and Shift+Tab inside, and on
  close gives focus back to whatever had it before. Escape or a click on the
  backdrop closes it. It is labelled by its title.
- **Server rendering.** The components render on the server. In the Next.js App
  Router they are client components (`'use client'`), so a server component can
  import them directly.

## Styling

Import the stylesheet once:

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
| `--react-chat-border`, `--react-chat-surface`, `--react-chat-input-bg` | lines; the input bar and the jump button; the text area |
| `--react-chat-user-bg`, `--react-chat-assistant-bg` | the two bubbles |
| `--react-chat-item-bg`, `-item-border`, `-item-text` | an item line |
| `--react-chat-card-bg`, `-card-border` | a card |
| `--react-chat-accent`, `-accent-text` | the Send button, the focus border |
| `--react-chat-tone-neutral`, `-progress`, `-ok`, `-warn`, `-bad` | an item's status (`-bad` also colours Stop) |
| `--react-chat-placeholder`, `--react-chat-backdrop` | the placeholder text, the modal's backdrop |
| `--react-chat-font-size`, `--react-chat-line-height`, `--react-chat-font-mono` | text size, line height, the item lines' font |
| `--react-chat-gap`, `--react-chat-padding`, `--react-chat-indent` | space between messages; around the thread and the input; the side left free opposite a message |
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

Every component takes `classNames`: one class per part, appended to the default.
It works with any class-based tool, for example Tailwind or CSS modules:

```tsx
<Chat {...props} classNames={{ userMessage: 'my-bubble', sendButton: 'my-send' }} />
```

The parts are `root`, `messages`, `viewport`, `thread`, `empty`, `row`,
`message`, `userMessage`, `assistantMessage`, `cursor`, `actions`, `loading`,
`jumpButton`, `item`, `itemIcon`, `itemLabel`, `itemStatus`, `itemSummary`,
`card`, `input`, `textarea`, `button`, `sendButton` and `stopButton`. `ChatModal`
adds `backdrop`, `modal`, `modalHeader`, `modalTitle`, `modalClose` and `modalBody`.

### 3. Render overrides

`renderMessage(message, defaultRender)` renders a message in place of the
package. Call `defaultRender(message)` for the kinds you do not change.
`renderInput(props)` replaces the input and gets what `ChatInput` would get.

```tsx
<Chat
  {...props}
  renderMessage={(m, defaultRender) => (m.kind === 'card' ? <MyCard>{m.content}</MyCard> : defaultRender(m))}
  renderInput={(p) => <MyComposer onSend={p.onSubmit} disabled={p.disabled} />}
/>
```

### `unstyled`

`unstyled` drops every default class, so only your `classNames` remain. Rows,
statuses and variants keep `data-kind`, `data-tone` and `data-variant` for you to
style by. Leave the stylesheet out in that case.

### Browsers

The stylesheet relies on `:where()`: Chrome and Edge 88, Safari 14 and Firefox 78,
or newer. The placeholder's default colour uses `color-mix()`, from Chrome 111,
Safari 16.2 and Firefox 113. An older browser shows its own placeholder colour.

## Labels

Every string the thread shows or announces comes from `labels`, a partial object
merged over the English defaults. `Chat` passes it down to the thread and the
input. `ChatModal` is rendered by you, so give it its own. There is no i18n
library inside: pass strings from whatever you translate with.

```tsx
<Chat {...props} labels={{ send: 'Wyślij', placeholder: 'Zadaj pytanie…' }} />
```

| key | default | where |
|---|---|---|
| `send` | `Send` | the send button |
| `stop` | `Stop` | the button while busy, when you pass `onStop` |
| `stopping` | `Stopping…` | the same button after a stop was asked for |
| `placeholder` | `Ask a question…` | the empty text area |
| `close` | `Close` | the modal's close button (its `aria-label`) |
| `loading` | `…` | the waiting marker after the last message |
| `jumpToLatest` | `Jump to latest` | the button back to the newest message, once the reader has scrolled up |

The defaults are exported as `defaultChatLabels`, and the type as `ChatLabels`.

## Components

| component | props |
|---|---|
| `Chat` | `messages`, `onSubmit(text)`. Optional: `prompt` + `onPromptChange` (you hold the text) or `defaultValue`; `busy` (no sending); `onStop` + `stopping` (the button becomes Stop while busy); `loading` (a waiting marker after the last message); `onOpenItem`; `empty` (shown with no messages); `renderMessage`; `renderInput` |
| `ChatMessages` | the thread alone, in a box of its own that scrolls (give it a height, or a flex parent): `messages`, `loading`, `onOpenItem`, `empty`, `renderMessage` |
| `ChatInput` | the input alone: `onSubmit(text)`. Optional: `prompt` + `onPromptChange` or `defaultValue`; `disabled`; `onStop`; `stopping` |
| `ItemMessage` | one item line: `message`, `onOpen` |
| `ChatModal` | a modal shell for an opened item: `open`, `title`, `onClose`, `children` |

`Chat`, `ChatMessages`, `ChatInput` and `ChatModal` also take `labels`, and every
component takes `classNames` and `unstyled`. The props types are exported
(`ChatProps`, `ChatInputProps`, …), as are `ChatMessage`, `ChatItem`, `ItemTone`,
`ChatClassNames`, `ChatPart`, `ChatStyling`, `ChatLabels` and `defaultChatLabels`.

## Versioning

From 1.0 the package follows [Semantic Versioning](https://semver.org/). Breaking
changes come only in a new major version. That covers the props, the message
shapes, the class names, the `--react-chat-*` variables and the `labels` keys.
Every release is listed in [CHANGELOG.md](CHANGELOG.md).

## Contributing

```sh
npm ci
npm run typecheck && npm run lint && npm test   # tests render on the server and in happy-dom
npm run build && npm run lint:package           # publint and attw on the packed package
npm run build && npx http-server .              # then open /example/
```

The CI also installs the packed package into an empty Vite app
([`test/vite-app/`](test/vite-app/)) and builds it there.

## License

MIT
