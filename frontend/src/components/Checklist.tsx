/**
 * Checklist Component
 * Displays pedagogical checklist items from the scenario
 */

import { ChecklistItem } from "@/hooks/useEcosApi";
import { useEcosSession } from "@/hooks/useEcosSession";


interface ChecklistProps {
  items: ChecklistItem[];
  compact?: boolean;
}

export default function Checklist({ items, compact = false }: ChecklistProps) {
  const { updateChecklistItem } = useEcosSession();

  const groupedByCategory = items.reduce(
    (acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  if (compact) {
    // Minimal vertical list for sidebar
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-bold text-slate-300 mb-3">Checklist</h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 text-xs text-slate-300"
            >
              <input
                type="checkbox"
                checked={item.completed || false}
                onChange={(e) => updateChecklistItem(item.id, e.target.checked)}
                className="mt-0.5"
              />
              <label className="flex-1 cursor-pointer">
                {item.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Full view with categories
  return (
    <div className="bg-slate-900 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Clinical Checklist</h2>

      {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            {category}
          </h3>
          <ul className="space-y-2 ml-4">
            {categoryItems.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={item.completed || false}
                  onChange={(e) =>
                    updateChecklistItem(item.id, e.target.checked)
                  }
                  className="mt-1 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={item.id}
                  className={`flex-1 cursor-pointer text-sm transition-all ${
                    item.completed
                      ? "line-through text-slate-500"
                      : "text-slate-200"
                  }`}
                >
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Progress summary */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="text-sm text-slate-300">
          {items.filter((i) => i.completed).length} of {items.length} completed
        </div>
        <div className="mt-2 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{
              width: `${(items.filter((i) => i.completed).length / items.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
