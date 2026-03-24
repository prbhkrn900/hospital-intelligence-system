import type { Page } from "@/App";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { LogIn, LogOut } from "lucide-react";

const pageTitles: Record<Page, string> = {
  home: "Home",
  dashboard: "Dashboard",
  patients: "Patient Management",
  doctors: "Doctor Management",
  appointments: "Appointment System",
  analytics: "Analytics & Reports",
};

const pageSubtitles: Record<Page, string> = {
  home: "",
  dashboard: "Overview of all hospital activity",
  patients: "View, add, and manage patient records",
  doctors: "Manage doctors and assignments",
  appointments: "Schedule and track appointments",
  analytics: "Charts, trends, and insights",
};

export default function Header({ activePage }: { activePage: Page }) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const initials = isLoggedIn
    ? identity.getPrincipal().toString().slice(0, 2).toUpperCase()
    : "?";

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between border-b px-6"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "rgba(14,165,233,0.12)",
        boxShadow:
          "0 1px 12px rgba(14,165,233,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
      }}
    >
      <div className="flex flex-col">
        <h1
          className="font-display text-xl font-bold tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, #0284C7 0%, #0EA5E9 50%, #38BDF8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {pageTitles[activePage]}
        </h1>
        {pageSubtitles[activePage] && (
          <p className="text-xs text-muted-foreground -mt-0.5">
            {pageSubtitles[activePage]}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    filter: "blur(4px)",
                    transform: "scale(1.2)",
                  }}
                />
                <Avatar className="relative h-9 w-9">
                  <AvatarFallback
                    className="text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground">
                  Signed in
                </p>
                <p className="text-xs text-muted-foreground max-w-[120px] truncate">
                  {identity.getPrincipal().toString().slice(0, 10)}…
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="gap-1.5 text-xs"
              style={{
                borderColor: "rgba(239,68,68,0.3)",
                color: "#EF4444",
                background: "rgba(239,68,68,0.05)",
              }}
              data-ocid="header.logout_button"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="gap-1.5 font-semibold shadow-glow-sm"
            style={{
              background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              border: "none",
              boxShadow:
                "0 4px 14px rgba(14,165,233,0.4), 0 1px 0 rgba(255,255,255,0.2) inset",
            }}
            data-ocid="header.login_button"
          >
            <LogIn className="h-4 w-4" />
            {isLoggingIn ? "Logging in…" : "Login"}
          </Button>
        )}
      </div>
    </header>
  );
}
