import { useCallback, useEffect, useRef, useState } from 'react';
import { PieChart, Wallet, X } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import ChatComposer from '../components/ChatComposer';
import SpendingSummary from '../components/SpendingSummary';
import { getBotReply } from '../lib/expenseBot';
import { fetchExpenses } from '../lib/expenseService';
import { startOfMonthISO, todayISO } from '../lib/format';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  text: "Hi! I'm your expense assistant. Tell me what you spent, like \"Lunch 12.50\", and I'll log it. Ask for a total or summary anytime.",
};

export default function ExpenseChatbot() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [busy, setBusy] = useState(false);
  const [monthExpenses, setMonthExpenses] = useState([]);
  const [summaryError, setSummaryError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const messageCounter = useRef(0);
  const scrollRef = useRef(null);

  const loadMonth = useCallback(async () => {
    try {
      const expenses = await fetchExpenses({ fromDate: startOfMonthISO(), toDate: todayISO() });
      setMonthExpenses(expenses);
      setSummaryError('');
    } catch (err) {
      setSummaryError(err.message);
    }
  }, []);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const handleSend = async (text) => {
    messageCounter.current += 1;
    const userMessage = { id: `user-${messageCounter.current}`, role: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setBusy(true);

    let reply;
    try {
      reply = await getBotReply(text);
    } catch (err) {
      reply = { text: err.message };
    }

    messageCounter.current += 1;
    setMessages((prev) => [
      ...prev,
      { id: `bot-${messageCounter.current}`, role: 'bot', ...reply },
    ]);
    setBusy(false);
    loadMonth();
  };

  return (
    <div className="flex h-dvh flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Wallet size={20} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">Expense Assistant</h1>
              <p className="text-xs text-slate-500">Log spending and check your totals</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSummary((open) => !open)}
            aria-expanded={showSummary}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 lg:hidden"
          >
            {showSummary ? <X size={16} aria-hidden="true" /> : <PieChart size={16} aria-hidden="true" />}
            {showSummary ? 'Close' : 'Summary'}
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 p-3 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
        <aside
          className={`${showSummary ? 'block' : 'hidden'} max-h-[45dvh] shrink-0 overflow-y-auto lg:order-last lg:block lg:max-h-none`}
        >
          <SpendingSummary expenses={monthExpenses} error={summaryError} />
        </aside>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {busy && (
              <div className="message-in flex items-center gap-3">
                <div className="flex h-8 items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4">
                  <span className="typing-dot" />
                  <span className="typing-dot [animation-delay:150ms]" />
                  <span className="typing-dot [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
          <ChatComposer onSend={handleSend} disabled={busy} />
        </section>
      </main>
    </div>
  );
}
