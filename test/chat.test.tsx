import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chat, ChatInput, type ChatMessage, ChatMessages, ChatModal, ItemMessage } from '../src/index.js';

const html = (node: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(node);
const noop = () => {};
const css = readFileSync('src/styles.css', 'utf8');

const everyKind: ChatMessage[] = [
  { id: '1', kind: 'user', content: 'what changed?', actions: <button type="button">edit</button> },
  { id: '2', kind: 'assistant', content: 'checking', streaming: true },
  { id: '3', kind: 'item', label: 'a step', icon: '•', status: { text: 'done', tone: 'ok' }, summary: '3 rows' },
  { id: '4', kind: 'card', content: 'a card' },
];

test('the bubbles carry whatever node the host gives them', () => {
  const messages: ChatMessage[] = [
    { id: '1', kind: 'user', content: 'what changed?' },
    { id: '2', kind: 'assistant', content: <b>nothing</b>, streaming: true },
  ];
  const out = html(<ChatMessages messages={messages} />);
  assert.match(out, /what changed\?/);
  assert.match(out, /<b>nothing<\/b>/);
  assert.match(out, /class="react-chat__message react-chat__message--user"/);
  assert.match(out, /class="react-chat__message react-chat__message--assistant"/);
  assert.match(out, /▍/, 'a streaming answer shows its cursor');
});

test('an item names its variant as a class and its status tone as a class', () => {
  const out = html(
    <ItemMessage
      message={{
        id: 'i',
        kind: 'item',
        label: 'prices',
        status: { text: 'refused', tone: 'bad' },
        summary: '12 rows',
        variant: 'nested',
      }}
    />,
  );
  assert.match(out, /class="react-chat__item react-chat__item--nested"/);
  assert.match(out, /data-tone="bad" class="react-chat__item-status react-chat__item-status--bad">refused</);
  assert.match(out, /12 rows/);
  assert.match(out, /disabled=""/, 'nothing to open without onOpen');
  assert.doesNotMatch(out, /aria-hidden/, 'no icon unless the host gives one');
});

test('an item without status or variant has neither, and its icon is the host’s', () => {
  const out = html(<ItemMessage message={{ id: 'i', kind: 'item', label: 'a file', icon: '📄' }} onOpen={noop} />);
  assert.match(out, /class="react-chat__item"/);
  assert.match(out, /<span aria-hidden="true" class="react-chat__item-icon">📄<\/span>/);
  assert.doesNotMatch(out, /status|data-variant/);
  assert.doesNotMatch(out, /disabled/);
});

test('a status without a tone is neutral', () => {
  const out = html(<ItemMessage message={{ id: 'i', kind: 'item', label: 'x', status: { text: 'queued' } }} />);
  assert.match(out, /react-chat__item-status--neutral">queued</);
});

test('a card holds the host’s body under its variant class', () => {
  const out = html(
    <ChatMessages
      messages={[{ id: 'c', kind: 'card', content: <button type="button">confirm</button>, variant: 'proposal' }]}
    />,
  );
  assert.match(out, /class="react-chat__card react-chat__card--proposal"/);
  assert.match(out, /confirm/);
});

test('the empty state shows only with no messages and nothing loading', () => {
  assert.match(html(<ChatMessages messages={[]} empty="ask me" />), /ask me/);
  assert.doesNotMatch(html(<ChatMessages messages={[]} loading empty="ask me" />), /ask me/);
});

test('the input sends nothing blank, and becomes Stop while busy when the host can stop', () => {
  assert.match(
    html(<ChatInput prompt="  " onPromptChange={noop} onSubmit={noop} />),
    /<button type="button" disabled=""[^>]*>Send/,
  );
  assert.doesNotMatch(
    html(<ChatInput prompt="hi" onPromptChange={noop} onSubmit={noop} />),
    /<button type="button" disabled=""[^>]*>Send/,
  );
  const busy = html(<Chat messages={[]} prompt="hi" onPromptChange={noop} onSubmit={noop} busy onStop={noop} />);
  assert.match(busy, />Stop</);
  assert.doesNotMatch(busy, />Send</);
});

test('classNames appends the host’s class to each part’s default', () => {
  const out = html(
    <Chat
      messages={everyKind}
      prompt=""
      onPromptChange={noop}
      onSubmit={noop}
      classNames={{ root: 'h-root', userMessage: 'h-user', message: 'h-msg', itemStatus: 'h-st', sendButton: 'h-send' }}
    />,
  );
  assert.match(out, /^<div class="react-chat h-root">/);
  assert.match(out, /class="react-chat__message react-chat__message--user h-msg h-user"/);
  assert.match(out, /class="react-chat__message react-chat__message--assistant h-msg"/);
  assert.match(out, /class="react-chat__item-status react-chat__item-status--ok h-st"/);
  assert.match(out, /class="react-chat__button react-chat__button--send h-send"/);
});

test('unstyled leaves only the host’s classes, and the data attributes to style by', () => {
  const out = html(
    <Chat
      messages={[...everyKind, { id: '5', kind: 'card', content: 'x', variant: 'proposal' }]}
      prompt=""
      onPromptChange={noop}
      onSubmit={noop}
      unstyled
      classNames={{ card: 'h-card' }}
    />,
  );
  assert.doesNotMatch(out, /react-chat/);
  assert.match(out, /data-variant="proposal" class="h-card"/);
  assert.match(out, /data-kind="user"/);
  assert.match(out, /data-tone="ok"/);
  const modal = html(
    <ChatModal open title="t" onClose={noop} unstyled>
      body
    </ChatModal>,
  );
  assert.doesNotMatch(modal, /class=/);
});

test('renderMessage replaces a message, and can fall back to the package’s own', () => {
  const out = html(
    <ChatMessages
      messages={everyKind}
      renderMessage={(message, defaultRender) =>
        message.kind === 'card' ? <aside>{message.content}</aside> : defaultRender(message)
      }
    />,
  );
  assert.match(out, /<aside>a card<\/aside>/);
  assert.doesNotMatch(out, /react-chat__card/);
  assert.match(out, /react-chat__message--user/);
});

test('renderInput replaces the input and gets what ChatInput would', () => {
  const out = html(
    <Chat
      messages={[]}
      prompt="draft"
      onPromptChange={noop}
      onSubmit={noop}
      busy
      placeholder="say"
      renderInput={(p) => <output>{`${p.prompt}|${p.disabled}|${p.placeholder}`}</output>}
    />,
  );
  assert.match(out, /<output>draft\|true\|say<\/output>/);
  assert.doesNotMatch(out, /textarea/);
});

test('the stylesheet styles every part, and weighs nothing', () => {
  const out =
    html(<Chat messages={everyKind} prompt="" onPromptChange={noop} onSubmit={noop} loading />) +
    html(<Chat messages={[]} prompt="" onPromptChange={noop} onSubmit={noop} busy onStop={noop} empty="e" />) +
    html(
      <ChatModal open title="t" onClose={noop}>
        b
      </ChatModal>,
    );
  const used = new Set([...out.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(' ')));
  // row modifiers for item, card and loading only name the kind; everything else has a rule
  for (const name of used) {
    if (/^react-chat__row--(item|card|loading)$/.test(name)) continue;
    assert.ok(css.includes(`.${name}`), `styles.css has no rule for .${name}`);
  }
  for (const tone of ['neutral', 'progress', 'ok', 'warn', 'bad']) {
    assert.ok(css.includes(`.react-chat__item-status--${tone}`), `no colour for the ${tone} tone`);
  }
  for (const line of css.split('\n')) {
    if (!/\{\s*$/.test(line) || /^\s*(@|\)|\d)/.test(line)) continue;
    assert.match(line.trim(), /^:where\(/, `a selector outside :where(): ${line.trim()}`);
  }
});
