import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import { Activity, Stethoscope, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "#0EA5E9",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: "none",
  fontSize: 13,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  background: "white",
};

export default function Analytics() {
  const { backend, isLoading: actorLoading } = useBackend();
  const [diseaseData, setDiseaseData] = useState<
    { name: string; count: number }[]
  >([]);
  const [admissionData, setAdmissionData] = useState<
    { month: string; count: number }[]
  >([]);
  const [workloadData, setWorkloadData] = useState<
    { name: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend || actorLoading) return;
    setLoading(true);
    Promise.all([
      backend.getDiseaseFrequency(),
      backend.getAdmissionsByDate(),
      backend.getDoctorAppointmentCounts(),
      backend.getAllDoctors(),
    ])
      .then(([diseases, admissions, workload, docs]) => {
        setDiseaseData(
          diseases.map(([name, count]) => ({ name, count: Number(count) })),
        );

        const monthMap = new Map<string, number>();
        for (const [date, count] of admissions) {
          const month = date.slice(0, 7);
          monthMap.set(month, (monthMap.get(month) ?? 0) + Number(count));
        }
        setAdmissionData(
          Array.from(monthMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count })),
        );

        const docMap = new Map(docs.map((d) => [d.id, d.name]));
        setWorkloadData(
          workload.map(([id, count]) => ({
            name: docMap.get(id) ?? `Dr. #${id}`,
            count: Number(count),
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [backend, actorLoading]);

  const topDisease = [...diseaseData].sort((a, b) => b.count - a.count)[0];
  const busyDoctor = [...workloadData].sort((a, b) => b.count - a.count)[0];
  const totalAdmissions = admissionData.reduce((s, d) => s + d.count, 0);

  const statCards = [
    {
      label: "Total Admissions",
      value: totalAdmissions,
      icon: Users,
      accent: "#0EA5E9",
      gradient: "linear-gradient(135deg, #0EA5E9, #0284C7)",
    },
    {
      label: "Disease Types",
      value: diseaseData.length,
      icon: Activity,
      accent: "#8B5CF6",
      gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    },
    {
      label: "Top Disease",
      value: topDisease?.name ?? "—",
      icon: TrendingUp,
      accent: "#F59E0B",
      gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    },
    {
      label: "Busiest Doctor",
      value: busyDoctor?.name ?? "—",
      icon: Stethoscope,
      accent: "#10B981",
      gradient: "linear-gradient(135deg, #10B981, #059669)",
    },
  ];

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        data-ocid="analytics.summary.section"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="card-lift border-border overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="h-1" style={{ background: card.gradient }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    {loading ? (
                      <Skeleton className="mt-1 h-7 w-24" />
                    ) : (
                      <p className="font-display mt-1 text-2xl font-bold text-foreground truncate max-w-[140px]">
                        {card.value}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: card.gradient,
                      boxShadow: `0 4px 12px ${card.accent}40`,
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #0EA5E9, #38BDF8)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(14,165,233,0.1)" }}
              >
                <Activity
                  className="h-3.5 w-3.5"
                  style={{ color: "#0EA5E9" }}
                />
              </span>
              Disease Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.disease_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.disease_chart.empty_state"
              >
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={diseaseData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="horizGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={90}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="count"
                    fill="url(#horizGrad)"
                    radius={[0, 4, 4, 0]}
                    name="Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #8B5CF6, #A78BFA)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(139,92,246,0.1)" }}
              >
                <TrendingUp
                  className="h-3.5 w-3.5"
                  style={{ color: "#8B5CF6" }}
                />
              </span>
              Patient Admissions by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.admissions_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : admissionData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.admissions_chart.empty_state"
              >
                No admission data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={admissionData}
                  margin={{ top: 4, right: 16, left: -16, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="lineAreaGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8B5CF6"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#8B5CF6", strokeWidth: 0 }}
                    name="Admissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #10B981, #34D399)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <Stethoscope
                  className="h-3.5 w-3.5"
                  style={{ color: "#10B981" }}
                />
              </span>
              Doctor Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.workload_chart.loading_state"
              >
                {["a", "b", "c", "d"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : workloadData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.workload_chart.empty_state"
              >
                No workload data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={workloadData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
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
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    name="Appointments"
                  >
                    {workloadData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            workloadData.indexOf(entry) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card
          className="border-border overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-1"
            style={{ background: "linear-gradient(90deg, #F59E0B, #FCD34D)" }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(245,158,11,0.1)" }}
              >
                <Activity
                  className="h-3.5 w-3.5"
                  style={{ color: "#F59E0B" }}
                />
              </span>
              Disease Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-2"
                data-ocid="analytics.disease_pie.loading_state"
              >
                {["a", "b", "c"].map((k) => (
                  <Skeleton key={k} className="h-6 w-full" />
                ))}
              </div>
            ) : diseaseData.length === 0 ? (
              <div
                className="flex h-48 items-center justify-center text-sm text-muted-foreground"
                data-ocid="analytics.disease_pie.empty_state"
              >
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={diseaseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                  >
                    {diseaseData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHART_COLORS[
                            diseaseData.indexOf(entry) % CHART_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
