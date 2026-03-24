import type { Page } from "@/App";
import {
  Facebook,
  Heart,
  Instagram,
  MessageCircle,
  Twitter,
} from "lucide-react";

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const roles = [
  {
    key: "dashboard" as Page,
    label: "Admin",
    subtitle: "Manage system & analytics",
    image: "/assets/generated/cartoon-hospital-transparent.dim_500x400.png",
    imageAlt: "Hospital administration illustration",
    accent: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #0284C7)",
    ocid: "admin",
    delay: "0ms",
  },
  {
    key: "doctors" as Page,
    label: "Doctor",
    subtitle: "Manage doctors & schedules",
    image: "/assets/generated/cartoon-doctor-male-transparent.dim_400x500.png",
    imageAlt: "Doctor illustration",
    accent: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    ocid: "doctor",
    delay: "80ms",
  },
  {
    key: "patients" as Page,
    label: "Patient",
    subtitle: "Patient records & history",
    image: "/assets/generated/cartoon-patient-transparent.dim_400x400.png",
    imageAlt: "Patient illustration",
    accent: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    ocid: "patient",
    delay: "160ms",
  },
];

const PARTICLES = [
  { id: "p1", size: 4, color: "#0EA5E9", top: 15, left: 10, delay: 0 },
  { id: "p2", size: 6, color: "#8B5CF6", top: 65, left: 15, delay: 0.8 },
  { id: "p3", size: 3, color: "#10B981", top: 40, left: 70, delay: 1.6 },
  { id: "p4", size: 5, color: "#F59E0B", top: 25, left: 85, delay: 2.4 },
  { id: "p5", size: 4, color: "#0EA5E9", top: 80, left: 55, delay: 3.2 },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav
        className="relative z-10 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(10,22,40,0.97)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "rgba(14,165,233,0.4)",
                  filter: "blur(6px)",
                  transform: "scale(1.3)",
                }}
              />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
                <Heart className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              Hospital IQ
            </span>
          </div>
          <div className="flex gap-1">
            {(["Admin", "Doctor", "Patient"] as const).map((label, i) => {
              const pages: Page[] = ["dashboard", "doctors", "patients"];
              return (
                <button
                  key={label}
                  type="button"
                  data-ocid={`nav.${label.toLowerCase()}.button`}
                  onClick={() => onNavigate(pages[i])}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:text-white"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-1">
          {["About Us", "Contact Us"].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <main
        className="relative flex flex-1 flex-col items-center justify-center px-8 py-20"
        style={{
          background:
            "linear-gradient(160deg, #060E1A 0%, #0A1628 30%, #0D1E38 60%, #080E1C 100%)",
        }}
      >
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 left-0 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
              transform: "translateY(-50%)",
            }}
          />
          {/* Floating particles */}
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-float"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                opacity: 0.5,
                top: `${p.top}%`,
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                boxShadow: "0 0 8px currentColor",
              }}
            />
          ))}
        </div>

        {/* Hero Text + Doctor Illustration */}
        <div className="relative mb-10 flex items-end justify-center gap-8">
          {/* Text block */}
          <div className="text-center">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background: "rgba(14,165,233,0.08)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              <div
                className="h-1.5 w-1.5 rounded-full bg-sky-400"
                style={{ boxShadow: "0 0 6px #38BDF8" }}
              />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "#7DD3FC" }}
              >
                Healthcare Intelligence Platform
              </span>
            </div>
            <h1
              className="font-display text-5xl font-bold text-white leading-tight mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Hospital Intelligence
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #0EA5E9 0%, #38BDF8 50%, #7DD3FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                System
              </span>
            </h1>
            <p
              style={{ color: "rgba(255,255,255,0.5)" }}
              className="text-lg max-w-md mx-auto leading-relaxed"
            >
              Streamline patient care, doctor management, and clinical analytics
              — all in one place.
            </p>
          </div>

          {/* Floating doctor illustration */}
          <div
            className="hidden lg:block shrink-0 animate-float"
            style={{ animationDuration: "4s" }}
          >
            <img
              src="/assets/generated/cartoon-doctor-female-transparent.dim_400x500.png"
              alt="Female doctor illustration"
              className="pointer-events-none select-none"
              style={{
                height: "220px",
                width: "auto",
                filter: "drop-shadow(0 8px 24px rgba(14,165,233,0.35))",
              }}
            />
          </div>
        </div>

        {/* Role Cards */}
        <div className="relative flex flex-wrap justify-center gap-6">
          {roles.map((role) => (
            <div
              key={role.key}
              className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2"
              style={{
                width: "260px",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                animationDelay: role.delay,
                transition:
                  "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  `${role.accent}40`;
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px ${role.accent}30, 0 0 40px ${role.accent}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 32px rgba(0,0,0,0.4)";
              }}
            >
              {/* Top gradient bar */}
              <div
                className="h-0.5 w-full"
                style={{ background: role.gradient }}
              />

              {/* Cartoon illustration */}
              <div
                className="flex items-center justify-center px-8 pt-8 pb-4"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${role.accent}10 0%, transparent 70%)`,
                }}
              >
                <img
                  src={role.image}
                  alt={role.imageAlt}
                  className="pointer-events-none select-none"
                  style={{
                    height: "120px",
                    width: "auto",
                    objectFit: "contain",
                    filter: `drop-shadow(0 6px 16px ${role.accent}40)`,
                  }}
                />
              </div>

              {/* Title & subtitle */}
              <div className="flex flex-col items-center px-8 pb-6">
                <h2 className="font-display text-xl font-bold text-white mb-1">
                  {role.label}
                </h2>
                <p
                  className="text-sm text-center"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {role.subtitle}
                </p>
              </div>

              {/* Divider */}
              <div
                className="mx-6 h-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />

              {/* Button */}
              <button
                type="button"
                data-ocid={`home.${role.ocid}.button`}
                onClick={() => onNavigate(role.key)}
                className="m-5 rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200"
                style={{
                  background: role.gradient,
                  boxShadow: `0 4px 16px ${role.accent}40`,
                }}
              >
                Enter {role.label} Portal
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          background: "#060E1A",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Gradient divider */}
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.6) 30%, rgba(139,92,246,0.6) 70%, transparent 100%)",
          }}
        />
        <div className="px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              {[
                {
                  href: "https://facebook.com",
                  icon: Facebook,
                  color: "#1877f2",
                  label: "Facebook",
                },
                {
                  href: "https://whatsapp.com",
                  icon: MessageCircle,
                  color: "#25d366",
                  label: "WhatsApp",
                },
                {
                  href: "https://instagram.com",
                  icon: Instagram,
                  color: "#e1306c",
                  label: "Instagram",
                },
                {
                  href: "https://twitter.com",
                  icon: Twitter,
                  color: "#1da1f2",
                  label: "Twitter",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-all hover:scale-110"
                  style={{
                    background: `${s.color}15`,
                    border: `1px solid ${s.color}30`,
                    color: s.color,
                  }}
                >
                  <s.icon size={15} />
                </a>
              ))}
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {new Date().getFullYear()} Hospital Intelligence System — Built
              with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "#38BDF8" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
