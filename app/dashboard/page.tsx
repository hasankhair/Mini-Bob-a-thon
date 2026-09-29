"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  DropletIcon,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Bell,
  LogOut,
  Clock,
  User,
  MapPin,
  Activity,
  ChevronDown,
} from "lucide-react";
import { FloodZone, FloodStatus, STATUS_CONFIG, MALAYSIA_STATES } from "@/lib/floodData";
import FloodAlertCard from "@/components/FloodAlertCard";
import BobChatWidget from "@/components/BobChatWidget";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

const FloodMap = dynamic(() => import("@/components/FloodMap"), { ssr: false });

interface FloodSummary {
  danger: number;
  warning: number;
  alert: number;
  normal: number;
  upcomingFloods: number;
  total: number;
}

const HOURS_LABELS = ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"];

function generateTrendData(zone: FloodZone) {
  const baseLevel = zone.level;
  return HOURS_LABELS.map((label, i) => {
    const trend = zone.trend === "rising" ? -0.3 + i * 0.07 : zone.trend === "falling" ? 0.4 - i * 0.07 : 0;
    return {
      time: label,
      level: parseFloat(Math.max(0, baseLevel + trend + (Math.random() * 0.1 - 0.05)).toFixed(2)),
      alert: zone.alertLevel,
      warning: zone.warningLevel,
      danger: zone.dangerLevel,
    };
  });
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [zones, setZones] = useState<FloodZone[]>([]);
  const [summary, setSummary] = useState<FloodSummary | null>(null);
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [filterState, setFilterState] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<FloodStatus | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [trendData, setTrendData] = useState<ReturnType<typeof generateTrendData>>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchFloodData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (filterState !== "all") params.set("state", filterState);
      if (filterStatus !== "all") params.set("status", filterStatus);
      const res = await fetch(`/api/flood?${params}`);
      const data = await res.json();
      setZones(data.zones);
      setSummary(data.summary);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch flood data:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [filterState, filterStatus]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    fetchFloodData();
  }, [fetchFloodData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchFloodData, 60000);
    return () => clearInterval(interval);
  }, [fetchFloodData]);

  useEffect(() => {
    if (selectedZone) {
      setTrendData(generateTrendData(selectedZone));
    } else if (zones.length > 0) {
      const firstDanger = zones.find((z) => z.status === "danger") || zones[0];
      setSelectedZone(firstDanger);
      setTrendData(generateTrendData(firstDanger));
    }
  }, [zones, selectedZone]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <DropletIcon className="w-12 h-12 animate-pulse mx-auto mb-3 text-blue-400" />
          <p className="text-lg opacity-70">Loading FloodWatch...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const filteredZones = zones;
  const dangerZones = zones.filter((z) => z.status === "danger");
  const upcomingZones = zones.filter((z) => z.forecastHours !== null);

  const summaryStats = [
    {
      label: "Danger",
      value: summary?.danger ?? 0,
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "Warning",
      value: summary?.warning ?? 0,
      icon: AlertTriangle,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Alert",
      value: summary?.alert ?? 0,
      icon: Bell,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    {
      label: "Normal",
      value: summary?.normal ?? 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  // Bar chart data for all zones
  const barData = zones.map((z) => ({
    name: z.river.replace("Sungai ", "Sg. "),
    level: z.level,
    danger: z.dangerLevel,
    status: z.status,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow">
                <DropletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">FloodWatch</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Malaysia</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Live</span>
                <span className="text-gray-300">•</span>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{lastUpdated.toLocaleTimeString("en-MY")}</span>
                <button
                  onClick={fetchFloodData}
                  disabled={isRefreshing}
                  className="ml-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-500" : "text-gray-400"}`} />
                </button>
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-24 truncate">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg w-48 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <div className="font-medium text-gray-900 text-sm truncate">{session.user?.name}</div>
                      <div className="text-gray-500 text-xs truncate">{session.user?.email}</div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active danger banner */}
        {dangerZones.length > 0 && (
          <div className="bg-red-600 text-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold">🚨 ACTIVE FLOOD DANGER: </span>
              {dangerZones.map((z) => z.river).join(", ")} — Evacuate immediately if in affected areas.
            </div>
            <a href="tel:999" className="flex-shrink-0 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
              Call 999
            </a>
          </div>
        )}

        {/* Upcoming flood alerts */}
        {upcomingZones.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-orange-800 text-sm">Upcoming Flood Alerts: </span>
              <span className="text-orange-700 text-sm">
                {upcomingZones
                  .sort((a, b) => (a.forecastHours ?? 99) - (b.forecastHours ?? 99))
                  .map((z) => `${z.district} (~${z.forecastHours}h)`)
                  .join(" • ")}
              </span>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryStats.map((s) => (
            <div
              key={s.label}
              className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}
            >
              <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-600 font-medium">{s.label} Zones</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content: Map + Zone List */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map - left/top */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">Live Flood Map — Malaysia</span>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                  Real-time
                </span>
              </div>
              <div className="h-[380px]">
                <FloodMap
                  zones={filteredZones}
                  onZoneSelect={(zone) => setSelectedZone(zone)}
                />
              </div>
            </div>
          </div>

          {/* Zone list - right/bottom */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All States</option>
                {MALAYSIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FloodStatus | "all")}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="danger">Danger</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            {/* Zone cards */}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-80 lg:max-h-[340px] pr-1">
              {filteredZones.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
                  No flood zones match the selected filters.
                </div>
              ) : (
                filteredZones
                  .sort((a, b) => {
                    const order = { danger: 0, warning: 1, alert: 2, normal: 3 };
                    return order[a.status] - order[b.status];
                  })
                  .map((zone) => (
                    <FloodAlertCard
                      key={zone.id}
                      zone={zone}
                      isSelected={selectedZone?.id === zone.id}
                      onClick={() => setSelectedZone(zone)}
                    />
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water level trend for selected zone */}
          {selectedZone && trendData.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{selectedZone.river} — Water Level Trend</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{selectedZone.district}, {selectedZone.state}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG[selectedZone.status].bg} ${STATUS_CONFIG[selectedZone.status].textColor} ${STATUS_CONFIG[selectedZone.status].border}`}
                >
                  {selectedZone.status.toUpperCase()}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STATUS_CONFIG[selectedZone.status].color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={STATUS_CONFIG[selectedZone.status].color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      `${value}m`,
                      name === "level" ? "Water Level" : String(name),
                    ]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke={STATUS_CONFIG[selectedZone.status].color}
                    strokeWidth={2.5}
                    fill="url(#levelGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="danger"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    fill="none"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="warning"
                    stroke="#f97316"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar chart: all zones current levels */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">All Monitored Rivers — Current Levels</h3>
            <p className="text-gray-500 text-xs mb-4">Compared to danger threshold (dashed)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value}m`, "Water Level"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="level" name="Current Level" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_CONFIG[entry.status as FloodStatus].color}
                    />
                  ))}
                </Bar>
                <Bar dataKey="danger" name="Danger Level" fill="#ef444440" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 pb-4">
          Data sourced from JPS (Jabatan Pengairan dan Saliran) Malaysia • Updated every 60 seconds •{" "}
          <span className="font-medium">Emergency: 999 | NADMA: 03-8870 0200</span>
        </div>
      </main>

      {/* IBM Bob Chat Widget */}
      <BobChatWidget />
    </div>
  );
}
