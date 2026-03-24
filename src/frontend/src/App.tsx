import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import Analytics from "@/pages/Analytics";
import Appointments from "@/pages/Appointments";
import Dashboard from "@/pages/Dashboard";
import Doctors from "@/pages/Doctors";
import Home from "@/pages/Home";
import Patients from "@/pages/Patients";
import { useState } from "react";

export type Page =
  | "home"
  | "dashboard"
  | "patients"
  | "doctors"
  | "appointments"
  | "analytics";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  if (activePage === "home") {
    return (
      <>
        <Home onNavigate={setActivePage} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "patients":
        return <Patients />;
      case "doctors":
        return <Doctors />;
      case "appointments":
        return <Appointments />;
      case "analytics":
        return <Analytics />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header activePage={activePage} />
        <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
        <footer className="shrink-0 border-t border-border bg-card px-6 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
