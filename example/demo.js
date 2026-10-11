// The thread in a light box and a dark one, with every message kind, a
// variant, and the modal. Plain ES modules: no bundler, no JSX, no Tailwind.
import { Chat, ChatModal } from '@krzysztofsztompka/react-chat';
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';

const start = [
  { id: '1', kind: 'user', content: 'Which of the three reports changed since Monday?' },
  {
    id: '2',
    kind: 'item',
    label: 'search reports --since monday',
    icon: '🔎',
    status: { text: 'done', tone: 'ok' },
    summary: '3 found',
  },
  { id: '3', kind: 'item', label: 'open sales.pdf', status: { text: 'running', tone: 'progress' }, variant: 'nested' },
  { id: '4', kind: 'item', label: 'open costs.pdf', status: { text: 'no access', tone: 'bad' } },
  {
    id: '5',
    kind: 'assistant',
    content: 'Two changed: sales (new March figures) and headcount. Costs could not be read.',
    actions: h('button', { type: 'button' }, 'Copy'),
  },
  { id: '6', kind: 'card', content: 'Ask the owner of costs.pdf for access?' },
  { id: '7', kind: 'assistant', content: 'Writing the summary', streaming: true },
];

function Demo() {
  const [messages, setMessages] = useState(start);
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(null);
  return h(
    'div',
    { style: { height: '100%' } },
    h(Chat, {
      messages,
      prompt,
      onPromptChange: setPrompt,
      onSubmit: () => {
        setMessages([...messages, { id: String(messages.length + 1), kind: 'user', content: prompt }]);
        setPrompt('');
      },
      onOpenItem: setOpen,
    }),
    h(
      ChatModal,
      {
        open: open != null || location.hash === '#modal',
        title: open?.label ?? 'An item',
        onClose: () => setOpen(null),
      },
      'What the host shows for this item.',
    ),
  );
}

for (const box of document.querySelectorAll('[data-demo]')) createRoot(box).render(h(Demo));
