import type { Page } from "@/App";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";

const navItems: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    color: "#0EA5E9",
  },
  { id: "patients", label: "Patients", icon: Users, color: "#10B981" },
  { id: "doctors", label: "Doctors", icon: Stethoscope, color: "#8B5CF6" },
  {
    id: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    color: "#F59E0B",
  },
  { id: "analytics", label: "Analytics", icon: BarChart2, color: "#EF4444" },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="flex w-64 shrink-0 flex-col"
      style={{
        background:
          "linear-gradient(180deg, #0A1628 0%, #0D1E36 50%, #0A1628 100%)",
        boxShadow:
          "2px 0 24px rgba(0,0,0,0.3), inset -1px 0 0 rgba(14,165,233,0.08)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background mesh */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(14,165,233,0.08) 0%, transparent 70%), " +
            "radial-gradient(ellipse 40% 30% at 50% 100%, rgba(139,92,246,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div
        className="relative flex items-center gap-3 px-5 py-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 rounded-xl opacity-40"
            style={{
              background: "rgba(14,165,233,0.3)",
              filter: "blur(8px)",
              transform: "scale(1.2)",
            }}
          />
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-xl animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
          >
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white leading-tight tracking-tight">
            Hospital IQ
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Intelligence System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="relative flex-1 px-3 py-5 space-y-1"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive ? "text-white" : "hover:text-white",
              )}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${item.color}22, ${item.color}10)`,
                      border: `1px solid ${item.color}30`,
                      boxShadow: `0 4px 16px ${item.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    }
                  : {
                      border: "1px solid transparent",
                      color: "rgba(255,255,255,0.55)",
                    }
              }
            >
              {/* Active left glow bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 8px ${item.color}`,
                  }}
                />
              )}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all"
                style={
                  isActive
                    ? { background: `${item.color}25`, color: item.color }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn(isActive ? "text-white" : "")}>
                {item.label}
              </span>
              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div
        className="relative px-4 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="relative flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: "rgba(16,185,129,0.15)" }}
            >
              <div
                className="h-2 w-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }}
              />
            </div>
            <div>
              <p
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                System Online
              </p>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                All services active
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
