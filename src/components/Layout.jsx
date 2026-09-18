import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Car, Package, FileText, Settings as SettingsIcon,
  Plus, Wrench, ClipboardList, X, Search, LogOut,
} from "lucide-react";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { useAuth } from "@/lib/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Car },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/work-orders", label: "Work Orders", icon: ClipboardList },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_TABS = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/inventory", label: "Parts", icon: Package },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/settings", label: "Setup", icon: SettingsIcon },
];

export default function Layout() {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { settings } = useShopSettings();
  const { logout } = useAuth();

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/work-orders?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/10 bg-[hsl(var(--sidebar-background))] transition-all duration-200 ${expanded ? "w-[220px]" : "w-16"}`}
        >
          <div className="flex h-14 items-center gap-2 px-3 border-b border-white/10">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-display font-bold">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="" className="h-9 w-9 rounded-md object-cover" />
              ) : (
                <Wrench className="h-5 w-5" />
              )}
            </div>
            {expanded && (
              <span className="font-display text-lg font-bold uppercase tracking-wide text-foreground truncate">
                {settings?.shop_name || "PitStop"}
              </span>
            )}
          </div>
          <nav className="flex-1 py-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {expanded && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-red-300 hover:bg-red-500/10 border-l-2 border-transparent transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {expanded && <span className="truncate">Log out</span>}
          </button>
        </aside>
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobile ? "md:ml-16" : ""}`}>
        {/* Top header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-[hsl(var(--sidebar-background))]/90 px-3 backdrop-blur-md">
          <Link to="/app" className="flex items-center gap-2 lg:hidden">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </div>
          </Link>
          <form onSubmit={onSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search VIN, plate, client…"
              className="input-base pl-9 h-9"
            />
          </form>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            Online
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-4 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-stretch border-t border-white/10 bg-[hsl(var(--sidebar-background))]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
          {MOBILE_TABS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Floating action button (mobile + desktop) */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 lg:bottom-6">
        {fabOpen && (
          <div className="flex flex-col gap-2 mb-2">
            <FabAction icon={ClipboardList} label="New Work Order" onClick={() => { setFabOpen(false); navigate("/work-orders/new"); }} />
            <FabAction icon={FileText} label="New Invoice" onClick={() => { setFabOpen(false); navigate("/invoices/new"); }} />
          </div>
        )}
        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Create new"
          className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
        >
          {fabOpen ? <X className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
        </button>
      </div>
    </div>
  );
}

function FabAction({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-full bg-card border border-white/10 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg active:scale-95 transition-transform">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </button>
  );
}
