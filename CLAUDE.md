# react-chat

`@krzysztofsztompka/react-chat`: a chat thread for React, published on npm. It
follows semver from 1.0.0. The README is the documentation for the people who
install it.

## What the package is

- **It keeps no conversation.** The host passes the whole `messages` list on every
  render. The package only reports what the person did: `onSubmit(text)`,
  `onStop`, `onOpenItem(item)`.
- **It knows no transport and no AI.** There are no tools, agents, models or
  status vocabularies, only generic shapes: bubbles, an `item` with
  `status: { text, tone }`, a `card`, a `variant` named by the host.
- **It is universal.** Every API and style decision is justified by what any host
  needs, never by one application that uses it. A name stays because it is a
  good generic name.
- **Every string comes from the host** through `labels`, with English defaults.
- **Styling** comes from its own `styles.css`, every rule in `:where()`. The
  overrides, lightest first: `--react-chat-*` variables, then `classNames` per
  part, then `renderMessage` / `renderInput`, then `unstyled`.

## How work is done

- Work from GitHub issues, one at a time. Each issue is one commit, pushed
  straight to `main` with `Closes #N`, with no pull request. The `main`
  ruleset lets the admin bypass the required checks.
- Before the commit: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`,
  `npm run lint:package`, `npm run docs:check`, `npm run check:secrets`. After the
  push, wait for CI to be green on Node 20, 22 and 24.
- **An API change updates, in the same commit:**
  - the README section that describes it, and its usage example where there is one;
  - its row in the README's API reference;
  - a test;
  - CHANGELOG `Unreleased`.
- A breaking change needs a new major version.
- Push over SSH (`git@github.com:uhlryk/react-chat.git`).

## Releasing

Releases go out only when the owner asks for one:
1. In the CHANGELOG, move `Unreleased` under the new version and update the compare links.
2. Run `npm version X --no-git-tag-version`.
3. Commit as `release: X — …`, push, and wait for green CI.
4. Run `git tag -a vX -m vX` and push the tag.

`release.yml` checks the tag against `package.json`, finds the CHANGELOG
section, scans for credentials, publishes through npm trusted publishing (OIDC,
with provenance, no token) and creates the GitHub Release.

Never run `npm publish` or `npm deprecate` by hand. After publishing, compare
the registry tarball's sha512 with a local `npm pack` of the same commit.

## Testing

- `test/chat.test.tsx` renders on the server (`renderToStaticMarkup`).
- `test/dom.test.tsx` runs in happy-dom, which lays nothing out: the test fakes
  `scrollHeight` and `clientHeight`. Compare DOM nodes by identity
  (`assert.ok(a === b)`). A failed `assert.equal` that prints a happy-dom node
  never finishes.
- `npm run coverage` measures `src/` on the compiled JS, with thresholds.
- `test/vite-app/` is an empty Vite app. CI builds it with the packed package.
