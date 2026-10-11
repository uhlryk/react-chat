import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Chat,
  ChatInput,
  type ChatLabels,
  type ChatMessage,
  ChatMessages,
  ChatModal,
  defaultChatLabels,
  ItemMessage,
} from '../src/index.js';

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
      labels={{ send: 'go' }}
      renderInput={(p) => <output>{`${p.prompt}|${p.disabled}|${p.labels?.send}`}</output>}
    />,
  );
  assert.match(out, /<output>draft\|true\|go<\/output>/);
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

test('labels replace every string, and no English default is left', () => {
  const labels: ChatLabels = {
    send: 'Wyślij',
    stop: 'Zatrzymaj',
    stopping: 'Zatrzymuję',
    placeholder: 'Zadaj pytanie',
    close: 'Zamknij',
    loading: 'czekam',
    jumpToLatest: 'Do najnowszych',
  };
  const props = { prompt: 'x', onPromptChange: noop, onSubmit: noop, labels };
  const out = [
    html(<Chat messages={everyKind} loading {...props} />),
    html(<Chat messages={[]} busy onStop={noop} {...props} />),
    html(<Chat messages={[]} busy onStop={noop} stopping {...props} />),
    html(<ChatMessages messages={[]} loading labels={labels} />),
    html(<ChatInput {...props} />),
    html(
      <ChatModal open title="t" onClose={noop} labels={labels}>
        b
      </ChatModal>,
    ),
  ].join('');
  // jumpToLatest shows only once the reader has scrolled up: dom.test.tsx covers it
  for (const text of Object.values({ ...labels, jumpToLatest: undefined }).filter(Boolean)) {
    assert.ok(out.includes(text as string), `${text} is shown`);
  }
  for (const text of Object.values(defaultChatLabels)) {
    assert.ok(!out.includes(text), `the default ${JSON.stringify(text)} is left`);
  }
});

test('a partial labels object keeps the English defaults for the rest', () => {
  const out = html(<ChatInput prompt="" onPromptChange={noop} onSubmit={noop} labels={{ send: 'Go' }} />);
  assert.match(out, />Go</);
  assert.match(out, /placeholder="Ask a question…"/);
});

test('the thread is a polite live log, busy while a reply is still arriving', () => {
  const settled = html(<ChatMessages messages={[{ id: '1', kind: 'assistant', content: 'done' }]} />);
  assert.match(settled, /role="log" aria-live="polite" class="react-chat__thread"/);
  const arriving = html(<ChatMessages messages={[{ id: '1', kind: 'assistant', content: 'do', streaming: true }]} />);
  assert.match(arriving, /role="log" aria-live="polite" aria-busy="true"/);
  assert.match(html(<ChatMessages messages={[]} loading />), /aria-busy="true"/);
});

test('an item is named by its label, status and summary, each its own word', () => {
  const out = html(
    <ItemMessage message={{ id: 'i', kind: 'item', label: 'prices', status: { text: 'ok' }, summary: '3 rows' }} />,
  );
  const ids = out.match(/aria-labelledby="([^"]*)"/)?.[1].split(' ') ?? [];
  assert.equal(ids.length, 3);
  const texts = ids.map((id) => out.match(new RegExp(`id="${id}"[^>]*>([^<]*)<`))?.[1]);
  assert.deepEqual(texts, ['prices', 'ok', '3 rows']);
});

test('every component is a client component, for React Server Components hosts', () => {
  for (const name of ['Chat', 'ChatInput', 'ChatMessages', 'ChatModal', 'ItemMessage']) {
    const source = readFileSync(`src/${name}.tsx`, 'utf8');
    assert.ok(source.startsWith("'use client';\n"), `${name}.tsx starts with 'use client'`);
  }
});
