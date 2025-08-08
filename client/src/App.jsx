import React, { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import clsx from 'clsx';

const defaultSystem = 'You are a helpful, concise AI assistant. Keep responses clear and prefer bullet points when appropriate.';

function MessageBubble({ role, content }) {
  const html = useMemo(() => marked.parse(content || ''), [content]);
  const isUser = role === 'user';
  return (
    <div className={clsx('w-full flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-md',
          isUser
            ? 'bg-brand-600/90 text-white shadow-glow'
            : 'bg-white/5 border border-white/10 backdrop-blur-xs'
        )}
      >
        <div className={clsx('prose prose-invert prose-sm md:prose-base markdown')} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I’m your AI assistant. Ask me anything.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusTag, setStatusTag] = useState('');
  const abortRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    fetch('/health').then(() => setStatusTag('Ready')).catch(() => setStatusTag('Offline'));
  }, []);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  async function sendMessage(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || loading) return;

    const history = [...messages, { role: 'user', content: text }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system: defaultSystem,
          messages: history
        })
      });

      if (!res.ok || !res.body) {
        throw new Error('Network error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    setMessages([{ role: 'assistant', content: 'Hi! I’m your AI assistant. Ask me anything.' }]);
  }

  return (
    <div className="min-h-svh flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-md">
        <header className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow"></div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">AI Chat</h1>
              <p className="text-xs text-slate-400">Streaming via OpenAI Responses API</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx('px-2 py-1 rounded-full text-xs border', statusTag === 'Ready' ? 'border-emerald-400 text-emerald-300' : 'border-rose-400 text-rose-300')}>
              {statusTag || '...'}
            </span>
            <button onClick={reset} className="hidden md:inline-flex px-3 py-1.5 text-xs rounded-full bg-white/10 hover:bg-white/20 border border-white/10">Reset</button>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-4 max-h-[65vh] overflow-y-auto" ref={listRef}>
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="text-xs text-slate-400 animate-pulse pl-2">Assistant is typing…</div>
          )}
        </main>

        <footer className="p-4 md:p-6 border-t border-white/10">
          <form onSubmit={sendMessage} className="relative">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 min-h-[48px] max-h-[160px] rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xs px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500/40 placeholder:text-slate-400"
                placeholder="Ask me anything…"
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={1}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') sendMessage(e);
                }}
              />
              {!loading ? (
                <button
                  type="submit"
                  className="px-5 h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-medium shadow-glow hover:shadow-lg hover:opacity-95 transition"
                >
                  Send
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stop}
                  className="px-5 h-12 rounded-2xl bg-rose-600/90 text-white font-medium hover:bg-rose-600 transition"
                >
                  Stop
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Tip: Press Ctrl/⌘ + Enter to send. To switch to GPT-5 later, set OPENAI_MODEL=gpt-5 on the server.
            </p>
          </form>
        </footer>
      </div>
    </div>
  );
}