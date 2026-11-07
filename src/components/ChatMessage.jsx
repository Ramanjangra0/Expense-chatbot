import { Bot, User } from 'lucide-react';
import { getCategory } from '../lib/categories';
import { formatCurrency, formatDay } from '../lib/format';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-in flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-700'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex min-w-0 max-w-[85%] flex-col gap-2 sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-emerald-600 text-white'
              : 'rounded-tl-sm bg-slate-100 text-slate-800'
          }`}
        >
          {message.text}
        </div>

        {message.expenses?.length > 0 && (
          <ul className="w-full min-w-[15rem] divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
            {message.expenses.map((expense) => (
              <li key={expense.id} className="flex items-center gap-3 px-3 py-2.5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getCategory(expense.category).dot}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{expense.description}</p>
                  <p className="text-xs text-slate-500">
                    {expense.category} · {formatDay(expense.expense_date)}
                  </p>
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-slate-900">
                  {formatCurrency(expense.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
