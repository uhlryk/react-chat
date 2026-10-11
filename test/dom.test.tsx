import './dom-setup.js';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { act, type ReactNode, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Chat, ChatInput, type ChatMessage, ChatModal } from '../src/index.js';

// happy-dom lays nothing out: every element reports the same made-up heights,
// and remembers the scrollTop it is given.
const layout = { scrollHeight: 1000, clientHeight: 300 };
const scrolled = new WeakMap<Element, number>();
Object.defineProperties(HTMLElement.prototype, {
  scrollHeight: { configurable: true, get: () => layout.scrollHeight },
  clientHeight: { configurable: true, get: () => layout.clientHeight },
  scrollTop: {
    configurable: true,
    get(this: Element) {
      return scrolled.get(this) ?? 0;
    },
    set(this: Element, value: number) {
      scrolled.set(this, value);
    },
  },
});

let host: HTMLElement;
let root: Root;
beforeEach(() => {
  layout.scrollHeight = 1000;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const render = (node: ReactNode) => act(() => root.render(node));
const $ = <T extends Element = HTMLElement>(selector: string) => host.querySelector<T>(selector);
const noop = () => {};
// compared by identity, with a short message: printing a happy-dom node in a failed diff never finishes
const same = (actual: unknown, expected: unknown, message: string) => assert.ok(actual === expected, message);
const name = (node: Element | null) =>
  node == null ? 'nothing' : `${node.tagName.toLowerCase()}#${node.id}.${node.className}`;
const thread = (n: number, last: ChatMessage['kind'] = 'assistant'): ChatMessage[] =>
  Array.from({ length: n }, (_, i) =>
    i === n - 1 && last === 'user'
      ? { id: String(i), kind: 'user', content: `q${i}` }
      : { id: String(i), kind: 'assistant', content: `a${i}` },
  );
const scrollTo = (top: number) =>
  act(() => {
    const box = $('.react-chat__viewport')!;
    box.scrollTop = top;
    box.dispatchEvent(new Event('scroll'));
  });

test('at the end, the thread follows what arrives', () => {
  render(<Chat messages={thread(3)} onSubmit={noop} />);
  assert.equal($('.react-chat__viewport')!.scrollTop, 1000);
  layout.scrollHeight = 1200;
  render(<Chat messages={thread(4)} onSubmit={noop} />);
  assert.equal($('.react-chat__viewport')!.scrollTop, 1200);
  same($('.react-chat__jump'), null, 'the jump control is gone');
});

test('scrolled up, the thread stays put and offers a way back', () => {
  render(<Chat messages={thread(3)} onSubmit={noop} labels={{ jumpToLatest: 'Newest' }} />);
  scrollTo(100);
  layout.scrollHeight = 1400;
  render(<Chat messages={thread(4)} onSubmit={noop} labels={{ jumpToLatest: 'Newest' }} />);
  const box = $('.react-chat__viewport')!;
  assert.equal(box.scrollTop, 100, 'the reader is not pulled down');
  const jump = $('.react-chat__jump')!;
  assert.equal(jump.textContent, 'Newest');
  act(() => jump.click());
  assert.equal(box.scrollTop, 1400);
  same($('.react-chat__jump'), null, 'the jump control is gone');
});

test('within a few pixels of the end still counts as the end', () => {
  render(<Chat messages={thread(3)} onSubmit={noop} />);
  scrollTo(1000 - 300 - 20);
  same($('.react-chat__jump'), null, 'the jump control is gone');
});

test('the person’s own new message brings them back down', () => {
  render(<Chat messages={thread(3)} onSubmit={noop} />);
  scrollTo(100);
  layout.scrollHeight = 1300;
  render(<Chat messages={thread(4, 'user')} onSubmit={noop} />);
  assert.equal($('.react-chat__viewport')!.scrollTop, 1300);
  same($('.react-chat__jump'), null, 'the jump control is gone');
});

const type = (field: HTMLTextAreaElement, value: string) =>
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
const enter = (field: HTMLElement) =>
  act(() => {
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });

test('an uncontrolled input sends its own text and empties itself', () => {
  const sent: string[] = [];
  render(<ChatInput defaultValue="hello" onSubmit={(text) => sent.push(text)} />);
  const field = $<HTMLTextAreaElement>('textarea')!;
  assert.equal(field.value, 'hello');
  act(() => $<HTMLButtonElement>('.react-chat__button--send')!.click());
  assert.deepEqual(sent, ['hello']);
  assert.equal(field.value, '');

  type(field, 'second');
  enter(field);
  assert.deepEqual(sent, ['hello', 'second']);
  assert.equal(field.value, '');

  enter(field);
  assert.deepEqual(sent, ['hello', 'second'], 'nothing blank is sent');
});

test('a controlled input hands its prompt to onSubmit and leaves clearing to the host', () => {
  const sent: string[] = [];
  render(<ChatInput prompt="kept" onPromptChange={noop} onSubmit={(text) => sent.push(text)} />);
  enter($('textarea')!);
  assert.deepEqual(sent, ['kept']);
  assert.equal($<HTMLTextAreaElement>('textarea')!.value, 'kept');
});

function WithModal({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" id="opener" onClick={() => setOpen(true)}>
        open
      </button>
      <ChatModal
        open={open}
        title="An item"
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
      >
        <button type="button" id="inside">
          inside
        </button>
      </ChatModal>
    </>
  );
}

const key = (name: string, shiftKey = false) =>
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }));
  });

test('the modal takes focus, keeps Tab inside, and gives focus back on close', () => {
  render(<WithModal />);
  const opener = $<HTMLButtonElement>('#opener')!;
  opener.focus();
  act(() => opener.click());
  const dialog = $('[role="dialog"]')!;
  same(document.activeElement, dialog, `focus is on ${name(document.activeElement)}`);
  assert.equal(dialog.getAttribute('aria-labelledby'), $('.react-chat__modal-title')!.id);

  const close = $<HTMLButtonElement>('.react-chat__modal-close')!;
  const inside = $<HTMLButtonElement>('#inside')!;
  inside.focus();
  key('Tab');
  same(
    document.activeElement,
    close,
    `Tab from the last wraps to the first: focus is on ${name(document.activeElement)}`,
  );
  key('Tab', true);
  same(
    document.activeElement,
    inside,
    `Shift+Tab from the first wraps to the last: focus is on ${name(document.activeElement)}`,
  );

  key('Escape');
  same($('[role="dialog"]'), null, 'the modal is closed');
  same(document.activeElement, opener, `focus is on ${name(document.activeElement)}`);
});

test('the modal’s focus survives a host that passes a new onClose every render', () => {
  let closes = 0;
  render(<WithModal onClose={() => closes++} />);
  // a browser focuses a clicked button; happy-dom does not
  $<HTMLButtonElement>('#opener')!.focus();
  act(() => $<HTMLButtonElement>('#opener')!.click());
  const inside = $<HTMLButtonElement>('#inside')!;
  inside.focus();
  render(<WithModal onClose={() => closes++} />);
  same(document.activeElement, inside, `focus is on ${name(document.activeElement)}`);
  act(() => $<HTMLButtonElement>('.react-chat__modal-close')!.click());
  assert.equal(closes, 1);
  same(document.activeElement, $('#opener'), `focus is on ${name(document.activeElement)}`);
});

test('a click on an item hands that item to onOpenItem', () => {
  const opened: string[] = [];
  const item = { id: 'i', kind: 'item', label: 'prices' } as const;
  render(<Chat messages={[item]} onSubmit={noop} onOpenItem={(m) => opened.push(m.id)} />);
  act(() => $<HTMLButtonElement>('.react-chat__item')!.click());
  assert.deepEqual(opened, ['i']);
});

test('content that grows by itself is followed at the end, and left alone once scrolled up', () => {
  const observers: (() => void)[] = [];
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(callback: () => void) {
      observers.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  const grow = () =>
    act(() => {
      for (const grown of observers) grown();
    });
  try {
    render(<Chat messages={thread(3)} onSubmit={noop} />);
    const box = $('.react-chat__viewport')!;
    layout.scrollHeight = 1100; // an image in the last message has loaded
    grow();
    assert.equal(box.scrollTop, 1100);
    scrollTo(100);
    layout.scrollHeight = 1200;
    grow();
    assert.equal(box.scrollTop, 100);
  } finally {
    globalThis.ResizeObserver = original;
  }
});

test('Stop calls onStop, and a controlled input reports every change', () => {
  let stops = 0;
  const changes: string[] = [];
  render(
    <ChatInput prompt="" onPromptChange={(v) => changes.push(v)} onSubmit={noop} disabled onStop={() => stops++} />,
  );
  act(() => $<HTMLButtonElement>('.react-chat__button--stop')!.click());
  assert.equal(stops, 1);
  type($<HTMLTextAreaElement>('textarea')!, 'abc');
  assert.deepEqual(changes, ['abc']);
});

test('the backdrop closes the modal, a click inside it does not', () => {
  let closes = 0;
  render(
    <ChatModal open title="t" onClose={() => closes++}>
      <p id="body">b</p>
    </ChatModal>,
  );
  act(() => $('#body')!.click());
  assert.equal(closes, 0);
  act(() => $('.react-chat__backdrop')!.click());
  assert.equal(closes, 1);
});

test('Tab from outside the modal lands inside it', () => {
  render(<WithModal />);
  const opener = $<HTMLButtonElement>('#opener')!;
  opener.focus();
  act(() => opener.click());
  opener.focus(); // focus escaped somehow
  key('Tab');
  same(document.activeElement, $('.react-chat__modal-close'), `focus is on ${name(document.activeElement)}`);
  opener.focus();
  key('Tab', true);
  same(document.activeElement, $('#inside'), `focus is on ${name(document.activeElement)}`);
});
