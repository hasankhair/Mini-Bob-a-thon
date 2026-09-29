"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropletIcon,
  MapPin,
  Bell,
  Clock,
  ShieldAlert,
  Users,
  ChevronRight,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { LoginForm, RegisterForm } from "@/components/AuthForms";
import { FLOOD_ZONES_DATA, STATUS_CONFIG, getFloodSummary } from "@/lib/floodData";

const summary = getFloodSummary();
const topZones = FLOOD_ZONES_DATA.filter((z) => z.status === "danger" || z.status === "warning").slice(0, 3);

const FEATURES = [
  {
    icon: MapPin,
    title: "Google Earth Integration",
    desc: "Live flood overlays on Google Maps/Earth with satellite terrain showing exactly which rivers and areas are at risk.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Clock,
    title: "Early Warning System",
    desc: "Get flood forecasts 2–24 hours in advance using rainfall data and river level trends for your area.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    desc: "Instant notifications when water levels reach Alert, Warning, or Danger thresholds at monitored gauges.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: Bot,
    title: "IBM Bob AI Assistant",
    desc: "Ask our AI assistant powered by IBM Bob about flood safety, evacuation routes, and emergency procedures.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Contacts",
    desc: "Instant access to NADMA, Civil Defence, and local emergency services with one tap during crisis.",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Users,
    title: "Community Dashboard",
    desc: "Track 8+ major river systems across Peninsular Malaysia, Sabah, and Sarawak in one unified view.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur shadow-sm border-b border-gray-200" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <DropletIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">FloodWatch Malaysia</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAuthMode("login")}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Register Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900" />
        
        {/* Animated water effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-500/30 to-transparent" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-400/10 animate-pulse"
              style={{
                width: `${200 + i * 80}px`,
                height: `${200 + i * 80}px`,
                top: `${10 + i * 12}%`,
                left: `${-10 + i * 18}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-80px)]">
            {/* Left: Hero text + Stats */}
            <div className="text-white py-12 lg:py-0">
              {/* Live status badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/90 font-medium">Live monitoring across Malaysia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Real-Time
                <br />
                <span className="text-blue-300">Flood Watch</span>
                <br />
                Malaysia
              </h1>

              <p className="text-lg text-blue-100/80 mb-8 max-w-xl leading-relaxed">
                Know current flood levels in your area. Get early warnings hours before floods reach your land.
                Stay safe with live river monitoring across all states.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { value: summary.danger.toString(), label: "Danger Zones", color: "text-red-400" },
                  { value: summary.warning.toString(), label: "Warning Zones", color: "text-orange-400" },
                  { value: summary.upcomingFloods.toString(), label: "Flood Alerts", color: "text-yellow-400" },
                  { value: summary.total.toString(), label: "Rivers Monitored", color: "text-green-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-3 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-white/60 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Live alerts preview */}
              {topZones.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Active Alerts</p>
                  {topZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: STATUS_CONFIG[zone.status].color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white">{zone.river}</span>
                        <span className="text-white/50 text-sm"> — {zone.district}, {zone.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{zone.level}m</span>
                        {zone.forecastHours !== null && (
                          <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full">
                            ~{zone.forecastHours}h
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Auth Card */}
            <div className="flex justify-center lg:justify-end py-8 lg:py-0">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                  {/* Tab switcher */}
                  <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        authMode === "login"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("register")}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        authMode === "register"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  {authMode === "login" ? (
                    <LoginForm onSwitch={() => setAuthMode("register")} />
                  ) : (
                    <RegisterForm onSwitch={() => setAuthMode("login")} />
                  )}
                </div>

                {/* Trust indicators */}
                <div className="mt-4 flex items-center justify-center gap-6 text-white/50 text-xs">
                  {["Free to use", "No spam", "JPS data"].map((item) => (
                    <div key={item} className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay safe
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              FloodWatch Malaysia combines real-time sensor data, satellite imagery, and AI to give you the most accurate flood information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How FloodWatch works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From sensor to your screen in seconds</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "River Sensors", desc: "JPS water level gauges measure river heights every 15 minutes at 200+ stations nationwide.", color: "bg-blue-100 text-blue-700" },
              { step: "02", title: "Rain Forecast", desc: "MetMalaysia rainfall predictions are combined with upstream river levels to model flood propagation.", color: "bg-purple-100 text-purple-700" },
              { step: "03", title: "AI Analysis", desc: "Our system analyses trends and calculates time-to-flood estimates for each monitored area.", color: "bg-orange-100 text-orange-700" },
              { step: "04", title: "Your Alert", desc: "You see live map overlays, status cards, and receive early warnings before floods reach your land.", color: "bg-green-100 text-green-700" },
            ].map((step, i) => (
              <div key={step.step} className="text-center relative">
                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-lg`}>
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <ChevronRight className="hidden md:block absolute top-7 -right-4 w-5 h-5 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Protect your family from floods</h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of Malaysians who monitor flood levels in their area. Free, fast, and always on.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setAuthMode("register");
            }}
            className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors shadow-lg text-lg"
          >
            Get Started — It&apos;s Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <DropletIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">FloodWatch Malaysia</span>
            </div>
            <div className="text-sm text-center">
              Data from JPS Malaysia • MetMalaysia • NADMA
              <br />
              Emergency: <span className="text-white font-semibold">999</span> | NADMA:{" "}
              <span className="text-white font-semibold">03-8870 0200</span>
            </div>
            <div className="text-xs text-gray-600">Powered by IBM Bob AI</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
