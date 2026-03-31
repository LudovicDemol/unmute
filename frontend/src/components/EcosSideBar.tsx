"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSidebarConfig } from "@/hooks/useEcosSidebar";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

import {
  ClipboardList,
  Clock,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";
import DisconnectLoginConfirmPopup from "./DisconnectLoginConfirmPopup";

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
  
];

export default function EcosSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const config = getSidebarConfig(pathname);
  const { user } = useAuthStore();

  const [expanded, setExpanded] = useState(config.defaultExpanded);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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
      <div className="p-3 border-t border-slate-200 relative">
        
        {showLogoutMenu && expanded && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowLogoutMenu(false)}
            />
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {/* Ligne "Se déconnecter" */}
              <button
                onClick={() => {
                  setShowLogoutMenu(false)
                  setShowDisconnectConfirm(true)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                Se déconnecter
              </button>

              
            </div>
          </>
        )}

  {/* Bouton profil toujours visible */}
  <button
    onClick={() => expanded && setShowLogoutMenu(v => !v)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors ${
      !expanded ? 'justify-center' : ''
    }`}
  >
    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-teal-600 font-semibold text-sm">
        {user?.user_metadata?.firstname?.[0]?.toUpperCase() || ''}
        {user?.user_metadata?.lastname?.[0]?.toUpperCase() || ''}
      </span>
    </div>
    {expanded && (
      <>
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span className="font-medium text-slate-900 text-sm truncate">
            {user?.user_metadata?.firstname} {user?.user_metadata?.lastname}
          </span>
          <span className="text-xs text-slate-400 truncate">{user?.email}</span>
        </div>
        <Settings className={`w-4 h-4 flex-shrink-0 transition-colors ${showLogoutMenu ? 'text-slate-500' : 'text-slate-300'}`} />
      </>
    )}
  </button>
</div>

      <DisconnectLoginConfirmPopup
        visible={showDisconnectConfirm}
        onConfirm={async () => {
          await supabase.auth.signOut()
          setShowDisconnectConfirm(false)
          setShowLogoutMenu(false)
          router.push('/')
        }}
        onCancel={() => setShowDisconnectConfirm(false)}
      />

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