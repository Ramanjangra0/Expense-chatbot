import { CATEGORIES, DEFAULT_CATEGORY } from '../lib/categories';
import { shiftDaysISO } from '../lib/format';

const ISO_DATE_PATTERN = /\b\d{4}-\d{2}-\d{2}\b/;
const AMOUNT_PATTERN = /(?:\$|usd\s*)?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)/i;

export function detectIntent(text) {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return 'empty';
  if (/^(help|\?|commands|what can you do)\b/.test(normalized)) return 'help';
  if (/\b(undo|delete (the )?last|remove (the )?last)\b/.test(normalized)) return 'undo';
  if (/^(show |list |view )?(my )?(recent|history|latest|last)\b|^list\b/.test(normalized)) return 'recent';
  if (/\d/.test(normalized)) return 'expense';
  if (/\btoday\b/.test(normalized)) return 'today';
  if (/\b(summary|report|breakdown|month|monthly|total|how much|spent|spending|expenses)\b/.test(normalized)) {
    return 'summary';
  }
  return 'unknown';
}

export function parseExpenseMessage(text) {
  let rest = text.trim();
  let expenseDate = shiftDaysISO(0);

  const isoMatch = rest.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    expenseDate = isoMatch[0];
    rest = rest.replace(isoMatch[0], ' ');
  } else if (/\byesterday\b/i.test(rest)) {
    expenseDate = shiftDaysISO(-1);
    rest = rest.replace(/\byesterday\b/i, ' ');
  } else if (/\btoday\b/i.test(rest)) {
    rest = rest.replace(/\btoday\b/i, ' ');
  }

  const amountMatch = rest.match(AMOUNT_PATTERN);
  if (!amountMatch) return null;

  const amount = Math.round(Number(amountMatch[1].replace(/,/g, '')) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return null;

  rest = rest.replace(amountMatch[0], ' ');

  const category = inferCategory(rest);
  const description = cleanDescription(rest) || category;

  return { amount, description, category, expense_date: expenseDate };
}

function inferCategory(text) {
  const lower = text.toLowerCase();
  const match = CATEGORIES.find((category) =>
    category.keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(lower)),
  );
  return match ? match.name : DEFAULT_CATEGORY;
}

function cleanDescription(text) {
  const cleaned = text
    .replace(/^\s*(i\s+)?(just\s+)?(spent|spend|paid|pay|bought|buy|got)\b/i, '')
    .replace(/^\s*(on|for|at)\b/i, '')
    .replace(/\s+(on|for|at)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-:,.]+|[\s\-:,.]+$/g, '')
    .trim();

  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : '';
}
