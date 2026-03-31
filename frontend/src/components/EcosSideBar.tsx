"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { getSidebarConfig } from "@/hooks/useEcosSidebar";

const NAV_ITEMS = [
  {
    href: "/scenarios",
    label: "Scénarios",
    sublabel: "Cas cliniques",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    href: "/historique",
    label: "Historique",
    sublabel: "Sessions passées",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/progression",
    label: "Progression",
    sublabel: "Statistiques",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    href: "/ressources",
    label: "Ressources",
    sublabel: "Guides & aide",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
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

    // Cas "hidden" : ne pas rendre la sidebar du tout
    if (config.hidden) return null;


  return (
    <aside
      className={clsx(
        "flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        expanded ? "w-60" : "w-16"
      )}
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
    >
      {/* Brand */}
      <div className="flex items-center h-16 border-b border-slate-100 flex-shrink-0 px-4">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h.5v5H4a1 1 0 000 2h5.5v5a1 1 0 002 0v-5H17a1 1 0 000-2h-5.5V4H12a1 1 0 000-2H9z" />
          </svg>
        </div>
        <div className={clsx(
          "ml-2.5 overflow-hidden transition-all duration-300",
          expanded ? "w-32 opacity-100" : "w-0 opacity-0"
        )}>
          <p className="text-sm font-bold text-slate-800 leading-tight whitespace-nowrap">ECOS Trainer</p>
          <p className="text-[10px] text-slate-400 font-mono whitespace-nowrap">v2.0</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!expanded ? item.label : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-xl transition-all duration-150 group relative h-11",
                expanded ? "px-3" : "justify-center",
                isActive
                  ? "bg-teal-50"
                  : "hover:bg-slate-50"
              )}
            >
              <span className={clsx(
                "flex-shrink-0 transition-colors",
                isActive ? "text-teal-500" : "text-slate-400 group-hover:text-slate-600"
              )}>
                {item.icon}
              </span>

              <div className={clsx(
                "overflow-hidden transition-all duration-300 min-w-0",
                expanded ? "flex-1 opacity-100" : "w-0 opacity-0"
              )}>
                <p className={clsx(
                  "text-sm font-semibold leading-tight whitespace-nowrap",
                  isActive ? "text-teal-700" : "text-slate-700"
                )}>
                  {item.label}
                </p>
                {item.sublabel && (
                  <p className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                    {item.sublabel}
                  </p>
                )}
              </div>

              {/* Active dot */}
              {isActive && (
                <span className={clsx(
                  "w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0",
                  expanded ? "ml-auto" : "absolute right-1.5 top-2"
                )} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="px-2 pb-2 flex-shrink-0">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={clsx(
            "flex items-center gap-2 rounded-xl px-3 py-2 w-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-150",
            !expanded && "justify-center"
          )}
        >
          <svg
            className={clsx("w-4 h-4 flex-shrink-0 transition-transform duration-300", !expanded && "rotate-180")}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className={clsx(
            "text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
            expanded ? "w-16 opacity-100" : "w-0 opacity-0"
          )}>
            Réduire
          </span>
        </button>
      </div>

      {/* Footer / user */}
      <div className="border-t border-slate-100 px-2 py-4 flex-shrink-0">
        <div className={clsx("flex items-center gap-3 px-2", !expanded && "justify-center px-0")}>
          <div
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0"
            title={!expanded ? "Étudiant" : undefined}
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>

          <div className={clsx(
            "flex-1 min-w-0 overflow-hidden transition-all duration-300",
            expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}>
            <p className="text-xs font-semibold text-slate-700 whitespace-nowrap">Étudiant</p>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">Médecine — DFGSM3</p>
          </div>

          <button className={clsx(
            "text-slate-300 hover:text-slate-500 transition-all duration-300 flex-shrink-0 overflow-hidden",
            expanded ? "opacity-100 w-4" : "opacity-0 w-0"
          )}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}