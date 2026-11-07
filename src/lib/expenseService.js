import { supabase } from '../lib/superbase';

const COLUMNS = 'id, description, amount, category, expense_date, created_at';
const LOAD_ERROR = "I couldn't load your expenses. Please try again.";
const SAVE_ERROR = "I couldn't save that expense. Please try again.";
const DELETE_ERROR = "I couldn't remove that expense. Please try again.";

function normalizeExpense(row) {
  return { ...row, amount: Number(row.amount) };
}

export async function fetchExpenses({ fromDate, toDate, limit } = {}) {
  let query = supabase
    .from('expenses')
    .select(COLUMNS)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (fromDate) query = query.gte('expense_date', fromDate);
  if (toDate) query = query.lte('expense_date', toDate);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !Array.isArray(data)) throw new Error(LOAD_ERROR);
  return data.map(normalizeExpense);
}

export async function addExpense({ amount, description, category, expense_date }) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ amount, description, category, expense_date })
    .select(COLUMNS)
    .maybeSingle();

  if (error || !data) throw new Error(SAVE_ERROR);
  return normalizeExpense(data);
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(DELETE_ERROR);
}
