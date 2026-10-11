---
name: Feature or API change
about: Something the package should do, or a change to what it exposes
labels: enhancement
---

## Today

<!-- What a host cannot do, or does awkwardly, and why. -->

## What lands

<!-- The API: props, message shapes, labels keys, classNames parts, CSS variables. Generic, for any host. -->

## Done when

<!-- How it is checked. -->

## Checklist (in the same commit)

- [ ] The README section that describes it, and its usage example
- [ ] A row per new export in the README's API reference (`npm run docs:check`)
- [ ] Tests, on the server or in the DOM; `npm run coverage` stays above its thresholds
- [ ] A CHANGELOG `Unreleased` entry; a breaking change is marked, and waits for a major version
- [ ] Any new string goes through `labels`, and any new element gets a `classNames` part and a `react-chat__…` class
