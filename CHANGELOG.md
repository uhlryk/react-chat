# Changelog

All notable changes to `@krzysztofsztompka/react-chat`. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [Unreleased]

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

[Unreleased]: https://github.com/uhlryk/react-chat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/uhlryk/react-chat/releases/tag/v0.1.0
