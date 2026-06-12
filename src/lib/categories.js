// Keyword rules for auto-inferring a class category from its name.
// Order matters — more specific matches (e.g. "inferno", "hot yoga") must come before broader ones.
const CATEGORY_KEYWORD_RULES = [
  { test: (n) => n.includes('reformer'), slug: 'reformer-pilates' },
  { test: (n) => n.includes('mat'), slug: 'mat-pilates' },
  { test: (n) => n.includes('inferno'), slug: 'inferno-hot-pilates' },
  { test: (n) => n.includes('hot yoga'), slug: 'hot-yoga' },
  { test: (n) => n.includes('barre'), slug: 'barre' },
  { test: (n) => n.includes('vinyasa'), slug: 'vinyasa' },
  { test: (n) => n.includes('hiit'), slug: 'hiit' },
  { test: (n) => n.includes('spin') || n.includes('cycle'), slug: 'spin' },
];

// Returns the slug of the first matching keyword rule for a class name, or null.
export function inferCategorySlug(className) {
  const name = (className || '').toLowerCase();
  for (const rule of CATEGORY_KEYWORD_RULES) {
    if (rule.test(name)) return rule.slug;
  }
  return null;
}

// Resolves a class name to a category_id: keyword match first, then the studio's
// default category, otherwise null (leaves the class uncategorized rather than blocking it).
export function inferCategoryId(className, categories, defaultCategoryId) {
  const slug = inferCategorySlug(className);
  if (slug) {
    const match = categories.find(c => c.slug === slug);
    if (match) return match.id;
  }
  return defaultCategoryId || null;
}

// Groups a flat, sort_order-ordered category list into { group_name, items } buckets
// for optgroup-style rendering. Preserves the incoming order.
export function groupCategories(categories) {
  const groups = [];
  const byGroup = new Map();
  for (const cat of categories) {
    const key = cat.group_name || 'Other';
    let group = byGroup.get(key);
    if (!group) {
      group = { group_name: key, items: [] };
      byGroup.set(key, group);
      groups.push(group);
    }
    group.items.push(cat);
  }
  return groups;
}

// Returns the display label for a class/draft record: category name, custom "Other" text,
// or null if it still needs a category selection.
export function categoryLabel(record, categories) {
  if (record.category_id) {
    const cat = categories.find(c => c.id === record.category_id);
    if (cat) return cat.name;
  }
  if (record.category_other) return record.category_other;
  return null;
}
