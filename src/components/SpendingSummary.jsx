import { getCategory, CATEGORIES } from '../lib/categories';
import { formatCurrency } from '../lib/format';

export default function SpendingSummary({ expenses, error }) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totals = new Map();
  expenses.forEach((expense) => {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  });
  const rows = CATEGORIES.filter((category) => totals.has(category.name))
    .map((category) => ({ ...category, value: totals.get(category.name) }))
    .sort((a, b) => b.value - a.value);
  const monthLabel = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{monthLabel}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {formatCurrency(total)}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Spent across {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {rows.length === 0 && !error && (
        <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No spending logged this month yet. Type an expense to get started.
        </p>
      )}

      {rows.length > 0 && (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => {
            const percent = total > 0 ? Math.round((row.value / total) * 100) : 0;
            return (
              <li key={row.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${getCategory(row.name).dot}`} aria-hidden="true" />
                    {row.name}
                  </span>
                  <span className="tabular-nums text-slate-600">
                    {formatCurrency(row.value)} <span className="text-slate-400">({percent}%)</span>
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${row.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
