"use client";

import { useState, useMemo, useEffect } from "react";
import type { ScenarioListItem } from "@/hooks/useScenario";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScenarioFiltersState {
  query: string;
  categories: string[];
  domains: string[];
}

interface ScenarioFiltersProps {
  scenarios: ScenarioListItem[];
  onChange: (filtered: ScenarioListItem[], filters: ScenarioFiltersState) => void;
}



// ─── Helpers ─────────────────────────────────────────────────────────────────

function unique(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function initFilters(): ScenarioFiltersState {
  return { query: "", categories: [], domains: []};
}

// ─── Pill toggle button ───────────────────────────────────────────────────────

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 whitespace-nowrap ${
        active
          ? "bg-teal-500 border-teal-500 text-white shadow-sm"
          : "bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600"
      }`}
    >
      {active && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </button>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────

export default function ScenarioFilters({ scenarios, onChange }: ScenarioFiltersProps) {
  const [filters, setFilters] = useState<ScenarioFiltersState>(initFilters);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const allCategories = useMemo(() => unique(scenarios.map((s) => s.category)), [scenarios]);
  const allDomains = useMemo(() => unique(scenarios.map((s) => s.domain)), [scenarios]);

  // Count active filters (excluding empty query and default age range)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length) count += filters.categories.length;
    if (filters.domains.length) count += filters.domains.length;
    return count;
  }, [filters]);

  // Apply filters
  const filtered = useMemo(() => {
    return scenarios.filter((s) => {
      const q = filters.query.toLowerCase();
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.firstname.toLowerCase().includes(q) ||
        s.lastname.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q);

      const matchesCategory =
        !filters.categories.length || filters.categories.includes(s.category);

      const matchesDomain =
        !filters.domains.length || filters.domains.includes(s.domain);


      return matchesQuery && matchesCategory && matchesDomain;
    });
  }, [scenarios, filters]);

  // Notify parent whenever filtered list changes
  useEffect(() => {
    onChange(filtered, filters);
  }, [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateFilters(patch: Partial<ScenarioFiltersState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function togglePill(key: "categories" | "domains", value: string) {
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function reset() {
    setFilters(initFilters());
  }

  const hasAnyFilter = !!filters.query || activeFilterCount > 0;

  return (
    <div className="space-y-3">
      {/* ── Search bar + filter toggle ── */}
      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            placeholder="Rechercher un cas, un patient, un domaine…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
          />
          {filters.query && (
            <button
              onClick={() => updateFilters({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
            filtersOpen || activeFilterCount > 0
              ? "bg-teal-500 border-teal-500 text-white"
              : "bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filtres
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-white text-teal-600">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Expandable filter panel ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          {/* Categories */}
          {allCategories.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Catégorie
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <Pill
                    key={cat}
                    label={cat}
                    active={filters.categories.includes(cat)}
                    onClick={() => togglePill("categories", cat)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {allCategories.length > 0 && allDomains.length > 0 && (
            <div className="h-px bg-slate-100" />
          )}

          {/* Domains */}
          {allDomains.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Domaine
              </p>
              <div className="flex flex-wrap gap-2">
                {allDomains.map((d) => (
                  <Pill
                    key={d}
                    label={d}
                    active={filters.domains.includes(d)}
                    onClick={() => togglePill("domains", d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-100" />

          {/* Footer: reset */}
          {hasAnyFilter && (
            <>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={reset}
                  className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Réinitialiser les filtres
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Active filter chips (summary when panel closed) ── */}
      {!filtersOpen && hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full"
            >
              {cat}
              <button
                onClick={() => togglePill("categories", cat)}
                className="ml-0.5 text-teal-400 hover:text-teal-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          {filters.domains.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full"
            >
              {d}
              <button
                onClick={() => togglePill("domains", d)}
                className="ml-0.5 text-violet-400 hover:text-violet-700 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <span className="text-xs text-slate-400 ml-1">
            — {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}