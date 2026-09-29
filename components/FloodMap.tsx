"use client";

import { useEffect, useRef, useState } from "react";
import { FloodZone, STATUS_CONFIG } from "@/lib/floodData";
import { MapPin, Layers, RefreshCw } from "lucide-react";

interface FloodMapProps {
  zones: FloodZone[];
  onZoneSelect?: (zone: FloodZone) => void;
}
declare global {
  interface Window {
    initFloodMap: () => void;
  }
}


export default function FloodMap({ zones, onZoneSelect }: FloodMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useEmbed, setUseEmbed] = useState(false);
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey === "your-google-maps-api-key") {
      setUseEmbed(true);
      return;
    }

    if (window.google?.maps) {
      initMap();
      return;
    }

    window.initFloodMap = initMap;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFloodMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, mapLoaded]);

  function initMap() {
    if (!mapRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 4.2105, lng: 108.9758 },
      zoom: 6,
      mapTypeId: "terrain",
      styles: [
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f0f4f8" }] },
      ],
    });

    setMapLoaded(true);
  }

  function updateMarkers() {
    if (!mapInstanceRef.current) return;

    // Clear existing
    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    zones.forEach((zone) => {
      const statusColor = STATUS_CONFIG[zone.status].color;
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; min-width: 200px;">
            <h3 style="margin: 0 0 8px; color: #1f2328; font-size: 14px;">${zone.river}</h3>
            <p style="margin: 0; color: #57606a; font-size: 12px;">${zone.district}, ${zone.state}</p>
            <div style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">
              <span style="background: ${statusColor}20; color: ${statusColor}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; border: 1px solid ${statusColor}40;">
                ${zone.status.toUpperCase()}
              </span>
              <span style="font-size: 13px; font-weight: 600; color: #1f2328;">${zone.level}m</span>
            </div>
            ${zone.forecastHours !== null ? `<p style="margin-top: 8px; color: #f97316; font-size: 12px; font-weight: 500;">⚠️ Flood expected in ~${zone.forecastHours}h</p>` : ""}
            <p style="margin-top: 4px; color: #57606a; font-size: 11px;">Rainfall 24h: ${zone.rainfall24h}mm</p>
          </div>
        `,
      });

      const marker = new window.google.maps.Marker({
        position: { lat: zone.lat, lng: zone.lng },
        map: mapInstanceRef.current!,
        title: `${zone.river} - ${zone.status.toUpperCase()}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: zone.status === "danger" ? 14 : zone.status === "warning" ? 12 : 10,
          fillColor: statusColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current!, marker);
        setSelectedZone(zone);
        onZoneSelect?.(zone);
      });

      // Pulse circle for danger/warning zones
      if (zone.status === "danger" || zone.status === "warning") {
        const circle = new window.google.maps.Circle({
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.status === "danger" ? 25000 : 15000,
          fillColor: statusColor,
          fillOpacity: 0.12,
          strokeColor: statusColor,
          strokeOpacity: 0.4,
          strokeWeight: 1,
          map: mapInstanceRef.current!,
        });
        circlesRef.current.push(circle);
      }

      markersRef.current.push(marker);
    });
  }

  if (useEmbed) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-blue-950">
        {/* Fallback satellite-style map using OpenStreetMap */}
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=99.6%2C1.2%2C119.3%2C7.4&layer=cyclemap"
          className="w-full h-full border-0"
          title="Malaysia Flood Map"
          loading="lazy"
        />
        {/* Overlay pins for flood zones */}
        <div className="absolute inset-0 pointer-events-none">
          {zones.map((zone) => {
            // Approximate lat/lng to percentage position within Malaysia bounding box
            const left = ((zone.lng - 99.6) / (119.3 - 99.6)) * 100;
            const top = ((7.4 - zone.lat) / (7.4 - 1.2)) * 100;
            const color = STATUS_CONFIG[zone.status].color;
            return (
              <div
                key={zone.id}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
                onClick={() => {
                  setSelectedZone(zone);
                  onZoneSelect?.(zone);
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-150 relative"
                  style={{ background: color }}
                >
                  {(zone.status === "danger" || zone.status === "warning") && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-60"
                      style={{ background: color }}
                    />
                  )}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  <div className="font-semibold">{zone.river}</div>
                  <div className="text-gray-300">{zone.level}m • {zone.status.toUpperCase()}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected zone info */}
        {selectedZone && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg max-w-[200px]">
            <button
              className="absolute top-1.5 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              onClick={() => setSelectedZone(null)}
            >×</button>
            <div className="pr-4">
              <div className="font-semibold text-gray-900 text-sm">{selectedZone.river}</div>
              <div className="text-gray-500 text-xs">{selectedZone.district}, {selectedZone.state}</div>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: STATUS_CONFIG[selectedZone.status].color + "20", color: STATUS_CONFIG[selectedZone.status].color, border: `1px solid ${STATUS_CONFIG[selectedZone.status].color}40` }}
                >
                  {selectedZone.status.toUpperCase()}
                </span>
                <span className="text-sm font-bold text-gray-900">{selectedZone.level}m</span>
              </div>
              {selectedZone.forecastHours !== null && (
                <div className="mt-1 text-orange-600 text-xs font-medium">⚠️ Flood in ~{selectedZone.forecastHours}h</div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-xl p-2.5 shadow-lg">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">Flood Status</div>
          {(["normal", "alert", "warning", "danger"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ background: STATUS_CONFIG[s].color }} />
              <span className="text-xs text-gray-600 capitalize">{s}</span>
            </div>
          ))}
        </div>

        {/* Earth-style badge */}
        <div className="absolute top-3 right-3 bg-blue-900/80 backdrop-blur text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
          <Layers className="w-3 h-3" />
          <span>Live Flood Layer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-blue-950 flex items-center justify-center">
          <div className="text-center text-white">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 opacity-60" />
            <p className="text-sm opacity-60">Loading flood map...</p>
          </div>
        </div>
      )}
      {mapLoaded && (
        <>
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-xl p-2.5 shadow-lg">
            <div className="text-xs font-semibold text-gray-700 mb-1.5">Flood Status</div>
            {(["normal", "alert", "warning", "danger"] as const).map((s) => (
              <div key={s} className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ background: STATUS_CONFIG[s].color }} />
                <span className="text-xs text-gray-600 capitalize">{s}</span>
              </div>
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-blue-900/80 backdrop-blur text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
            <MapPin className="w-3 h-3" />
            <span>Google Earth • Live Flood Layer</span>
          </div>
        </>
      )}
    </div>
  );
}
