import { detectIntent, parseExpenseMessage } from '../lib/expenseParser';
import { addExpense, deleteExpense, fetchExpenses } from '../lib/expenseService';
import { formatCurrency, formatDay, shiftDaysISO, startOfMonthISO, todayISO } from '../lib/format';
import { getCategory } from '../lib/categories';

const HELP_TEXT = [
  'Log an expense by typing it naturally:',
  '- Lunch 12.50',
  '- Taxi $18 yesterday',
  '- Groceries 64 on 2026-10-30',
  '',
  'Or ask me for:',
  "- Today's total",
  '- Monthly summary',
  '- Recent expenses',
  '- Undo last',
].join('\n');

const UNKNOWN_TEXT =
  'I didn\'t catch an amount there. Type an expense like "Coffee 4.50", or ask for "Today\'s total" or "Monthly summary".';

export async function getBotReply(message) {
  switch (detectIntent(message)) {
    case 'help':
      return { text: HELP_TEXT };
    case 'undo':
      return undoLastExpense();
    case 'recent':
      return recentExpenses();
    case 'today':
      return todayTotal();
    case 'summary':
      return monthSummary();
    case 'expense':
      return logExpense(message);
    default:
      return { text: UNKNOWN_TEXT };
  }
}

async function logExpense(message) {
  const parsed = parseExpenseMessage(message);
  if (!parsed) {
    return { text: 'I need an amount greater than zero. Try something like "Lunch 12.50".' };
  }

  const saved = await addExpense(parsed);
  return {
    text: `Logged ${formatCurrency(saved.amount)} for ${saved.description} under ${saved.category} on ${formatDay(saved.expense_date)}.`,
    expenses: [saved],
  };
}

async function undoLastExpense() {
  const [latest] = await fetchExpenses({ limit: 1 });
  if (!latest) return { text: 'There are no expenses to remove.' };

  await deleteExpense(latest.id);
  return {
    text: `Removed ${formatCurrency(latest.amount)} for ${latest.description}.`,
    expenses: [latest],
  };
}

async function recentExpenses() {
  const recent = await fetchExpenses({ limit: 5 });
  if (recent.length === 0) return { text: "You haven't logged any expenses yet." };

  return {
    text: 'Here are your most recent expenses.',
    expenses: recent,
  };
}

async function todayTotal() {
  const today = await fetchExpenses({ fromDate: todayISO(), toDate: todayISO() });
  if (today.length === 0) return { text: 'Nothing logged for today yet.' };

  const total = today.reduce((sum, expense) => sum + expense.amount, 0);
  return {
    text: `You've spent ${formatCurrency(total)} today across ${today.length} ${today.length === 1 ? 'expense' : 'expenses'}.`,
    expenses: today,
  };
}

async function monthSummary() {
  const monthly = await fetchExpenses({ fromDate: startOfMonthISO(), toDate: todayISO() });
  if (monthly.length === 0) return { text: 'No spending logged this month yet.' };

  const totals = new Map();
  monthly.forEach((expense) => {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  });
  const [topName, topTotal] = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
  const total = monthly.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    text: `This month you've spent ${formatCurrency(total)} across ${monthly.length} ${monthly.length === 1 ? 'expense' : 'expenses'}. Your biggest category is ${getCategory(topName).name} at ${formatCurrency(topTotal)}.`,
  };
}
