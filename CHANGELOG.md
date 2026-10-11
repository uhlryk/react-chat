# Changelog

All notable changes to `@krzysztofsztompka/react-chat`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- The components are marked `'use client'`, so a React Server Components host
  (the Next.js App Router) imports them directly.
- `publint` and `attw` run in CI (`npm run lint:package`).
- CI installs the packed package into an empty Vite + React app with no
  Tailwind and builds it.
- The README covers streaming and stopping, items with the modal, browser
  support, versioning and contributing.

### Changed

- `package.json` declares `"type": "commonjs"`.

## [0.4.0] - 2026-10-11

### Added

- The input can hold its own text: leave out `prompt`, optionally give
  `defaultValue`, and `onSubmit(text)` gets the text while the input empties
  itself. The controlled form (`prompt` + `onPromptChange`) stays.
- `onSubmit` gets the text in both forms.
- Autoscroll follows the end only while the reader is there. A reader who
  scrolled up stays put and gets a "Jump to latest" button (`labels.jumpToLatest`,
  part `jumpButton`). The person's own new message brings them back down. Content
  that grows by itself (an image loading) is followed too.
- The thread is `role="log"` with `aria-live="polite"`, and `aria-busy` while a
  reply is streaming or loading.
- An item line's accessible name is its label, status and summary as separate words.
- `ChatModal` moves focus in, keeps Tab inside, returns focus to the opener on
  close, and is labelled by its title.
- Tests in a DOM (happy-dom): scrolling, the uncontrolled input, the modal's focus.

### Changed

- **Breaking:** `ChatMessages` is its own scrolling box: a `messages` wrapper
  (`react-chat__messages`) holds the `viewport` and the jump button. Used alone,
  it needs a height or a flex parent. `Chat` looks the same.
- `prompt` and `onPromptChange` are optional on `Chat` and `ChatInput`.

## [0.3.0] - 2026-10-11

### Added

- `labels` on `Chat`, `ChatMessages`, `ChatInput` and `ChatModal`: every string the
  thread shows or announces (`send`, `stop`, `stopping`, `placeholder`, `close`,
  `loading`), merged over the English defaults. `Chat` passes it down.
- The `ChatLabels` type and the `defaultChatLabels` object are exported.

### Removed

- **Breaking:** the `placeholder` prop on `Chat` and `ChatInput`. Use
  `labels.placeholder` instead.

## [0.2.0] - 2026-10-11

### Added

- A stylesheet of its own, `@krzysztofsztompka/react-chat/styles.css`, with every
  rule in `:where()`. Tailwind is no longer needed.
- `classNames` on every component: a host class per part, appended to the default.
- `renderMessage(message, defaultRender)` and `renderInput(props)` replace a part.
- `unstyled`: no default classes at all. `data-kind`, `data-tone` and
  `data-variant` stay for the host to style by.
- Variables for size and space: `--react-chat-font-size`, `-line-height`,
  `-font-mono`, `-gap`, `-padding`, `-indent`, `-radius`, `-bubble-radius`,
  `-item-radius`, `-button-radius`, `-placeholder`, `-backdrop`, `-modal-width`,
  `-modal-z`.
- The props types are exported, as are `ChatClassNames`, `ChatPart` and `ChatStyling`.
- `example/`: a page with no build step and no Tailwind.

### Changed

- **Breaking:** the components carry `react-chat__*` classes instead of Tailwind
  classes. A host that used `@source` imports `styles.css` instead. The variable
  names and the `react-chat__item--{variant}` / `react-chat__card--{variant}`
  classes are unchanged.
- The thread's root sets `color: var(--react-chat-text)`, so the host's nodes
  inside follow the theme.
- The streaming cursor and the waiting marker stop pulsing under
  `prefers-reduced-motion`. The cursor is `aria-hidden`.

## [0.1.0] - 2026-10-11

### Added

- `Chat`, `ChatMessages`, `ChatInput`, `ItemMessage` and `ChatModal`: a chat thread
  with no store and no transport. The host passes the messages and is told what
  the person did.
- Four message kinds: `user` and `assistant` bubbles, `item` lines (a status in
  the host's words with one of five tones, a `variant` class, an icon) and `card`
  blocks.
- Every colour as a `--react-chat-*` CSS variable with a light default.
- ES modules and CommonJS, with types.

[Unreleased]: https://github.com/uhlryk/react-chat/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/uhlryk/react-chat/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/uhlryk/react-chat/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/uhlryk/react-chat/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/uhlryk/react-chat/releases/tag/v0.1.0
