import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chat, ChatInput, type ChatMessage, ChatMessages, ItemMessage } from '../src/index.js';

const html = (node: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(node);

test('the bubbles carry whatever node the host gives them', () => {
  const messages: ChatMessage[] = [
    { id: '1', kind: 'user', content: 'what changed?' },
    { id: '2', kind: 'assistant', content: <b>nothing</b>, streaming: true },
  ];
  const out = html(<ChatMessages messages={messages} />);
  assert.match(out, /what changed\?/);
  assert.match(out, /<b>nothing<\/b>/);
  assert.match(out, /▍/, 'a streaming answer shows its cursor');
});

test('an item names its variant as a class and colours its status by tone', () => {
  const out = html(
    <ItemMessage
      message={{
        id: 'i',
        kind: 'item',
        label: 'prices',
        status: { text: 'odmowa', tone: 'bad' },
        summary: '12 rows',
        variant: 'nested',
      }}
    />,
  );
  assert.match(out, /class="react-chat__item react-chat__item--nested /);
  assert.match(out, /--react-chat-tone-bad[^"]*">odmowa</);
  assert.match(out, /12 rows/);
  assert.match(out, /disabled=""/, 'nothing to open without onOpen');
  assert.doesNotMatch(out, /aria-hidden/, 'no icon unless the host gives one');
});

test('an item without status or variant has neither, and its icon is the host’s', () => {
  const out = html(<ItemMessage message={{ id: 'i', kind: 'item', label: 'a file', icon: '📄' }} onOpen={() => {}} />);
  assert.match(out, /class="react-chat__item flex/);
  assert.match(out, /<span aria-hidden="true">📄<\/span>/);
  assert.doesNotMatch(out, /tone-/);
  assert.doesNotMatch(out, /disabled/);
});

test('a status without a tone is neutral', () => {
  const out = html(<ItemMessage message={{ id: 'i', kind: 'item', label: 'x', status: { text: 'queued' } }} />);
  assert.match(out, /--react-chat-tone-neutral[^"]*">queued</);
});

test('a card holds the host’s body under its variant class', () => {
  const out = html(
    <ChatMessages
      messages={[{ id: 'c', kind: 'card', content: <button type="button">confirm</button>, variant: 'proposal' }]}
    />,
  );
  assert.match(out, /class="react-chat__card react-chat__card--proposal /);
  assert.match(out, /confirm/);
});

test('the empty state shows only with no messages and nothing loading', () => {
  assert.match(html(<ChatMessages messages={[]} empty="ask me" />), /ask me/);
  assert.doesNotMatch(html(<ChatMessages messages={[]} loading empty="ask me" />), /ask me/);
});

test('the input sends nothing blank, and becomes Stop while busy when the host can stop', () => {
  const noop = () => {};
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
