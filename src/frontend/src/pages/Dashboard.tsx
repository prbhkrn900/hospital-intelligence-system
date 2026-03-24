import type { Page } from "@/App";
import type { Appointment, DashboardTotals } from "@/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const kpiConfig = [
  {
    label: "Total Patients",
    key: "totalPatients" as const,
    navigateTo: "patients" as Page,
    icon: Users,
    gradient: "linear-gradient(135deg, #0EA5E9, #0284C7)",
    glow: "rgba(14,165,233,0.35)",
    borderColor: "#0EA5E9",
    trend: "+12%",
    trendUp: true,
    ocid: "dashboard.total_patients.card",
  },
  {
    label: "Total Doctors",
    key: "totalDoctors" as const,
    navigateTo: "doctors" as Page,
    icon: Stethoscope,
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    glow: "rgba(16,185,129,0.35)",
    borderColor: "#10B981",
    trend: "+3%",
    trendUp: true,
    ocid: "dashboard.total_doctors.card",
  },
  {
    label: "Total Appointments",
    key: "totalAppointments" as const,
    navigateTo: "appointments" as Page,
    icon: CalendarDays,
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    glow: "rgba(139,92,246,0.35)",
    borderColor: "#8B5CF6",
    trend: "+8%",
    trendUp: true,
    ocid: "dashboard.total_appointments.card",
  },
  {
    label: "Today's Appointments",
    key: "todaysAppointments" as const,
    navigateTo: "appointments" as Page,
    icon: Clock,
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    glow: "rgba(245,158,11,0.35)",
    borderColor: "#F59E0B",
    trend: "Today",
    trendUp: null,
    ocid: "dashboard.todays_appointments.card",
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { backend, isLoading: actorLoading } = useBackend();
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [diseaseData, setDiseaseData] = useState<
    { name: string; count: number }[]
  >([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend || actorLoading) return;
    const today = new Date().toISOString().slice(0, 10);
    setLoading(true);
    Promise.all([
      backend.getDashboardTotals(today),
      backend.getDiseaseFrequency(),
      backend.getAllAppointments(),
    ])
      .then(([t, diseases, appts]) => {
        setTotals(t);
        setDiseaseData(
          diseases.map(([name, count]) => ({ name, count: Number(count) })),
        );
        const sorted = [...appts].sort((a, b) => (a.date < b.date ? 1 : -1));
        setRecentAppointments(sorted.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [backend, actorLoading]);

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; dot: string }> = {
      booked: { bg: "rgba(14,165,233,0.1)", color: "#0EA5E9", dot: "#0EA5E9" },
      completed: {
        bg: "rgba(16,185,129,0.1)",
        color: "#10B981",
        dot: "#10B981",
      },
      cancelled: {
        bg: "rgba(239,68,68,0.1)",
        color: "#EF4444",
        dot: "#EF4444",
      },
    };
    const s = map[status] ?? {
      bg: "rgba(107,114,128,0.1)",
      color: "#6B7280",
      dot: "#6B7280",
    };
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ background: s.bg, color: s.color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: s.dot, boxShadow: `0 0 4px ${s.dot}` }}
        />
        {status}
      </span>
    );
  };

  const getInitials = (id: bigint) => {
    const n = Number(id);
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[n % 26] + (letters[(n * 7) % 26] || "X");
  };

  const avatarColors = [
    "linear-gradient(135deg, #0EA5E9, #0284C7)",
    "linear-gradient(135deg, #10B981, #059669)",
    "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    "linear-gradient(135deg, #F59E0B, #D97706)",
    "linear-gradient(135deg, #EF4444, #DC2626)",
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div
        className="relative flex items-center overflow-hidden rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, #060E1A 0%, #0D1E38 60%, #0A1628 100%)",
          border: "1px solid rgba(14,165,233,0.15)",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(14,165,233,0.08)",
          minHeight: "130px",
        }}
        data-ocid="dashboard.welcome.section"
      >
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139,92,246,0.08) 0%, transparent 60%)",
          }}
        />
        {/* Gradient left accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{
            background: "linear-gradient(180deg, #0EA5E9, #8B5CF6)",
          }}
        />

        {/* Doctor illustration */}
        <div className="relative ml-4 shrink-0">
          <img
            src="/assets/generated/cartoon-doctor-female-transparent.dim_400x500.png"
            alt="Doctor illustration"
            className="pointer-events-none select-none"
            style={{
              height: "120px",
              width: "auto",
              filter: "drop-shadow(0 4px 12px rgba(14,165,233,0.4))",
            }}
          />
        </div>

        {/* Text content */}
        <div className="relative flex-1 px-6 py-5">
          <h2
            className="font-display text-xl font-bold leading-tight mb-1"
            style={{
              background: "linear-gradient(90deg, #fff 0%, #7DD3FC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to Hospital IQ
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Manage patients, doctors, and appointments all in one place.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              data-ocid="dashboard.welcome.patients.button"
              onClick={() => onNavigate("patients")}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              }}
            >
              Patients
            </button>
            <button
              type="button"
              data-ocid="dashboard.welcome.doctors.button"
              onClick={() => onNavigate("doctors")}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
              }}
            >
              Doctors
            </button>
            <button
              type="button"
              data-ocid="dashboard.welcome.appointments.button"
              onClick={() => onNavigate("appointments")}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
              }}
            >
              Appointments
            </button>
          </div>
        </div>

        {/* Right decorative cartoon */}
        <div className="relative mr-4 hidden xl:block shrink-0">
          <img
            src="/assets/generated/cartoon-doctor-male-transparent.dim_400x500.png"
            alt="Doctor illustration"
            className="pointer-events-none select-none"
            style={{
              height: "110px",
              width: "auto",
              filter: "drop-shadow(0 4px 12px rgba(16,185,129,0.35))",
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        data-ocid="dashboard.kpi.section"
      >
        {kpiConfig.map((card) => {
          const Icon = card.icon;
          const value = totals ? Number(totals[card.key]) : 0;
          return (
            <Card
              key={card.label}
              data-ocid={card.ocid}
              onClick={() => onNavigate(card.navigateTo)}
              className="card-lift border-border overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
              style={{
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {/* Gradient top border */}
              <div className="h-1" style={{ background: card.gradient }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton className="mt-1 h-9 w-24" />
                    ) : (
                      <p className="font-display mt-1 text-3xl font-bold text-foreground">
                        {value.toLocaleString()}
                      </p>
                    )}
                    <div className="mt-2">
                      {card.trendUp !== null ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            color: "#10B981",
                          }}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {card.trend}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            color: "#D97706",
                          }}
                        >
                          {card.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: card.gradient,
                      boxShadow: `0 4px 16px ${card.glow}`,
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Disease Chart */}
        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #0EA5E9, #38BDF8)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(14,165,233,0.1)" }}
              >
                <Users className="h-3.5 w-3.5" style={{ color: "#0EA5E9" }} />
              </span>
              Disease Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="dashboard.disease_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
                data-ocid="dashboard.disease_chart.empty_state"
              >
                No disease data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={diseaseData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradBlue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#0284C7"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "none",
                      fontSize: 13,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      background: "white",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradBlue)"
                    radius={[6, 6, 0, 0]}
                    name="Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Appointments */}
        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #8B5CF6, #7C3AED)" }}
          />
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(139,92,246,0.1)" }}
              >
                <CalendarDays
                  className="h-3.5 w-3.5"
                  style={{ color: "#8B5CF6" }}
                />
              </span>
              Recent Appointments
            </CardTitle>
            <button
              type="button"
              data-ocid="dashboard.view_all_appointments.link"
              onClick={() => onNavigate("appointments")}
              className="text-xs font-semibold"
              style={{ color: "#0EA5E9" }}
            >
              View all →
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div
                className="space-y-2 p-4"
                data-ocid="dashboard.recent_appointments.loading_state"
              >
                {["a", "b", "c", "d", "e"].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div
                className="flex h-40 items-center justify-center text-sm text-muted-foreground"
                data-ocid="dashboard.recent_appointments.empty_state"
              >
                No appointments yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentAppointments.map((appt, idx) => (
                  <div
                    key={String(appt.id)}
                    data-ocid={`dashboard.recent_appointments.item.${idx + 1}`}
                    className="table-row-accent flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        background: avatarColors[idx % avatarColors.length],
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {getInitials(appt.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        Appointment #{String(appt.id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appt.date} at {appt.time}
                      </p>
                    </div>
                    {statusBadge(appt.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
