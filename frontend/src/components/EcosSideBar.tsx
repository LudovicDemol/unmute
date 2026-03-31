"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSidebarConfig } from "@/hooks/useEcosSidebar";
import {
  ClipboardList,
  Clock,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/scenarios",
    label: "Scénarios",
    sublabel: "Cas cliniques",
    icon: ClipboardList,
  },
  {
    href: "/history",
    label: "Historique",
    sublabel: "Sessions passées",
    icon: Clock,
  },
  {
    href: "/progression",
    label: "Progression",
    sublabel: "Statistiques",
    icon: BarChart3,
  },
  {
    href: "/ressources",
    label: "Ressources",
    sublabel: "Guides & aide",
    icon: BookOpen,
  },
];

export default function EcosSidebar() {
  const pathname = usePathname();
  const config = getSidebarConfig(pathname);

  const [expanded, setExpanded] = useState(config.defaultExpanded);

  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      const newConfig = getSidebarConfig(pathname);
      setExpanded(newConfig.defaultExpanded);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  if (config.hidden) return null;

  return (
    <aside
      className={`${
        expanded ? "w-60" : "w-16"
      } relative bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 flex items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          {expanded && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-slate-900 whitespace-nowrap">
                Medscène
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Formation ECOS
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={`${
                isActive
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-700 hover:bg-slate-50"
              } flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                !expanded ? "justify-center" : ""
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-teal-500" : "text-slate-400"
                }`}
              />
              {expanded && (
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate text-sm">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {item.sublabel}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-200">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 ${
            !expanded ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-teal-600 font-semibold text-sm">ÉT</span>
          </div>
          {expanded && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-slate-900 text-sm truncate">
                Étudiant
              </span>
              <span className="text-xs text-slate-500 truncate">
                Médecine — DFGSM3
              </span>
            </div>
          )}
          {expanded && (
            <button className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
      >
        {expanded ? (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        )}
      </button>
    </aside>
  );
}