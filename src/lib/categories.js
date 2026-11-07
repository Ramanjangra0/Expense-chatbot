export const CATEGORIES = [
  {
    name: 'Food',
    keywords: ['lunch', 'dinner', 'breakfast', 'coffee', 'groceries', 'grocery', 'restaurant', 'food', 'snack', 'pizza', 'cafe', 'drinks'],
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
  },
  {
    name: 'Travel',
    keywords: ['taxi', 'uber', 'lyft', 'bus', 'train', 'fuel', 'gas', 'petrol', 'flight', 'parking', 'toll', 'trip', 'hotel'],
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  {
    name: 'Bills',
    keywords: ['rent', 'electricity', 'water', 'internet', 'phone', 'bill', 'utilities', 'insurance', 'subscription'],
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  {
    name: 'Shopping',
    keywords: ['clothes', 'clothing', 'shoes', 'shopping', 'amazon', 'gadget', 'furniture'],
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
  {
    name: 'Entertainment',
    keywords: ['movie', 'movies', 'cinema', 'netflix', 'game', 'games', 'concert', 'music', 'party'],
    dot: 'bg-orange-500',
    bar: 'bg-orange-500',
  },
  {
    name: 'Health',
    keywords: ['medicine', 'pharmacy', 'doctor', 'dentist', 'gym', 'clinic', 'hospital'],
    dot: 'bg-teal-500',
    bar: 'bg-teal-500',
  },
  {
    name: 'Other',
    keywords: [],
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
  },
];

export const DEFAULT_CATEGORY = CATEGORIES[CATEGORIES.length - 1].name;

export function getCategory(name) {
  return CATEGORIES.find((category) => category.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}
