"use client";
import { groupCategories } from '@/lib/categories';

// Renders a category <select> grouped by group_name (optgroup-style) with an "Other"
// option at the bottom. When "Other" is selected, a text input is shown for a custom value.
export default function CategorySelect({
  categories,
  value,
  otherValue,
  onChange,
  onOtherChange,
  placeholder,
  required,
  className,
  otherClassName,
}) {
  const groups = groupCategories(categories);
  const isOther = value === 'other';

  return (
    <div className="space-y-2">
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        required={required}
        className={className}
      >
        {placeholder && <option value={placeholder.value} disabled={placeholder.disabled}>{placeholder.label}</option>}
        {groups.map(g => (
          <optgroup key={g.group_name} label={g.group_name}>
            {g.items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        ))}
        <option value="other">Other</option>
      </select>

      {isOther && (
        <input
          type="text"
          placeholder="Enter a category name"
          value={otherValue || ''}
          onChange={e => onOtherChange(e.target.value)}
          required={required}
          className={otherClassName || className}
        />
      )}
    </div>
  );
}
