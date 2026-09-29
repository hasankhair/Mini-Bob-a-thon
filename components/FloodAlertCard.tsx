"use client";

import { FloodZone, STATUS_CONFIG } from "@/lib/floodData";
import { Clock, TrendingUp, TrendingDown, Minus, Droplets, AlertTriangle } from "lucide-react";

interface FloodAlertCardProps {
  zone: FloodZone;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function FloodAlertCard({ zone, onClick, isSelected }: FloodAlertCardProps) {
  const status = STATUS_CONFIG[zone.status];
  const progressPct = Math.min(100, (zone.level / zone.dangerLevel) * 100);

  const TrendIcon =
    zone.trend === "rising"
      ? TrendingUp
      : zone.trend === "falling"
      ? TrendingDown
      : Minus;

  const trendColor =
    zone.trend === "rising"
      ? "text-red-500"
      : zone.trend === "falling"
      ? "text-green-500"
      : "text-gray-400";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? `${status.border} ${status.bg} shadow-md`
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{zone.river}</div>
          <div className="text-gray-500 text-xs mt-0.5">
            {zone.district}, {zone.state}
          </div>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${status.bg} ${status.textColor} border ${status.border}`}
        >
          {status.label.toUpperCase()}
        </span>
      </div>

      {/* Level info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-xl font-bold text-gray-900">{zone.level.toFixed(1)}m</span>
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Danger at {zone.dangerLevel}m</div>
          <div className="text-xs text-gray-500">Rain: {zone.rainfall24h}mm/24h</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        {/* Markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
          style={{ left: `${(zone.alertLevel / zone.dangerLevel) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
          style={{ left: `${(zone.warningLevel / zone.dangerLevel) * 100}%` }}
        />
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background:
              zone.status === "danger"
                ? "#ef4444"
                : zone.status === "warning"
                ? "#f97316"
                : zone.status === "alert"
                ? "#f59e0b"
                : "#22c55e",
          }}
        />
      </div>

      {/* Forecast alert */}
      {zone.forecastHours !== null && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-semibold text-orange-700">
              Flood forecast in approximately{" "}
              <strong>{zone.forecastHours} hour{zone.forecastHours !== 1 ? "s" : ""}</strong>
            </span>
          </div>
          <Clock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        </div>
      )}
    </button>
  );
}
