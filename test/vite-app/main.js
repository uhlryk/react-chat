// Nothing but the package and its stylesheet: no Tailwind, no CSS tool, no JSX plugin.
import '@krzysztofsztompka/react-chat/styles.css';
import { Chat } from '@krzysztofsztompka/react-chat';
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [messages, setMessages] = useState([
    { id: '1', kind: 'user', content: 'Does it render without Tailwind?' },
    { id: '2', kind: 'item', label: 'check styles.css', status: { text: 'ok', tone: 'ok' }, summary: 'imported' },
    { id: '3', kind: 'assistant', content: 'Yes: the stylesheet is all it needs.' },
    { id: '4', kind: 'card', content: 'A card, styled.' },
  ]);
  return h(Chat, {
    messages,
    onSubmit: (text) => setMessages([...messages, { id: String(messages.length + 1), kind: 'user', content: text }]),
  });
}

createRoot(document.getElementById('root')).render(h(App));
