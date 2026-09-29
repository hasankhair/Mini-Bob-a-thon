export const MALAYSIA_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
];

export const MALAYSIA_DISTRICTS: Record<string, string[]> = {
  Johor: ["Johor Bahru", "Muar", "Batu Pahat", "Segamat", "Kluang", "Mersing", "Kota Tinggi", "Pontian"],
  Kedah: ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi", "Kubang Pasu", "Baling", "Yan"],
  Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Bachok", "Pasir Puteh", "Tanah Merah", "Gua Musang", "Machang"],
  "Kuala Lumpur": ["Chow Kit", "Bangsar", "Petaling Jaya", "Cheras", "Kepong", "Titiwangsa"],
  Labuan: ["Labuan Town", "Victoria"],
  Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
  "Negeri Sembilan": ["Seremban", "Port Dickson", "Rembau", "Kuala Pilah", "Tampin", "Jelebu"],
  Pahang: ["Kuantan", "Temerloh", "Bentong", "Raub", "Jerantut", "Rompin", "Maran", "Bera", "Pekan"],
  Perak: ["Ipoh", "Taiping", "Teluk Intan", "Manjung", "Kuala Kangsar", "Hilir Perak", "Hulu Perak"],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  "Pulau Pinang": ["Georgetown", "Bayan Lepas", "Butterworth", "Bukit Mertajam", "Kepala Batas"],
  Putrajaya: ["Putrajaya"],
  Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau", "Beaufort", "Kudat"],
  Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu", "Sarikei", "Sri Aman", "Limbang"],
  Selangor: ["Shah Alam", "Klang", "Petaling Jaya", "Subang Jaya", "Ampang", "Sepang", "Hulu Langat", "Kuala Selangor"],
  Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun", "Besut", "Marang", "Hulu Terengganu"],
};

export interface FloodZone {
  id: string;
  state: string;
  district: string;
  river: string;
  level: number; // meters
  normalLevel: number; // normal water level
  alertLevel: number;
  warningLevel: number;
  dangerLevel: number;
  trend: "rising" | "falling" | "stable";
  status: "normal" | "alert" | "warning" | "danger";
  forecastHours: number | null; // hours until flood expected (null = no flood expected)
  lastUpdated: string;
  lat: number;
  lng: number;
  rainfall24h: number; // mm
}

export type FloodStatus = "normal" | "alert" | "warning" | "danger";

export const STATUS_CONFIG: Record<FloodStatus, { label: string; color: string; bg: string; border: string; textColor: string }> = {
  normal: {
    label: "Normal",
    color: "#22c55e",
    bg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
  },
  alert: {
    label: "Alert",
    color: "#f59e0b",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    textColor: "text-yellow-700",
  },
  warning: {
    label: "Warning",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    textColor: "text-orange-700",
  },
  danger: {
    label: "Danger",
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-700",
  },
};

function computeStatus(level: number, alertL: number, warningL: number, dangerL: number): FloodStatus {
  if (level >= dangerL) return "danger";
  if (level >= warningL) return "warning";
  if (level >= alertL) return "alert";
  return "normal";
}

// Realistic flood zone data for major Malaysian rivers
export const FLOOD_ZONES_DATA: FloodZone[] = [
  {
    id: "sg-kelantan",
    state: "Kelantan",
    district: "Kota Bharu",
    river: "Sungai Kelantan",
    level: 4.8,
    normalLevel: 2.0,
    alertLevel: 3.5,
    warningLevel: 4.5,
    dangerLevel: 6.0,
    trend: "rising",
    status: "warning",
    forecastHours: 6,
    lastUpdated: new Date().toISOString(),
    lat: 6.1254,
    lng: 102.2381,
    rainfall24h: 142,
  },
  {
    id: "sg-pahang",
    state: "Pahang",
    district: "Pekan",
    river: "Sungai Pahang",
    level: 3.9,
    normalLevel: 1.5,
    alertLevel: 4.0,
    warningLevel: 5.5,
    dangerLevel: 7.5,
    trend: "rising",
    status: "alert",
    forecastHours: 12,
    lastUpdated: new Date().toISOString(),
    lat: 3.4854,
    lng: 103.3386,
    rainfall24h: 88,
  },
  {
    id: "sg-rajang",
    state: "Sarawak",
    district: "Sibu",
    river: "Sungai Rajang",
    level: 2.1,
    normalLevel: 1.8,
    alertLevel: 3.0,
    warningLevel: 4.0,
    dangerLevel: 6.0,
    trend: "stable",
    status: "normal",
    forecastHours: null,
    lastUpdated: new Date().toISOString(),
    lat: 2.3,
    lng: 111.8,
    rainfall24h: 22,
  },
  {
    id: "sg-perak",
    state: "Perak",
    district: "Teluk Intan",
    river: "Sungai Perak",
    level: 5.2,
    normalLevel: 2.0,
    alertLevel: 3.5,
    warningLevel: 5.0,
    dangerLevel: 7.0,
    trend: "rising",
    status: "warning",
    forecastHours: 4,
    lastUpdated: new Date().toISOString(),
    lat: 4.0,
    lng: 101.02,
    rainfall24h: 115,
  },
  {
    id: "sg-klang",
    state: "Selangor",
    district: "Klang",
    river: "Sungai Klang",
    level: 2.8,
    normalLevel: 1.2,
    alertLevel: 2.5,
    warningLevel: 3.5,
    dangerLevel: 5.0,
    trend: "falling",
    status: "alert",
    forecastHours: null,
    lastUpdated: new Date().toISOString(),
    lat: 3.044,
    lng: 101.445,
    rainfall24h: 55,
  },
  {
    id: "sg-johor",
    state: "Johor",
    district: "Kota Tinggi",
    river: "Sungai Johor",
    level: 6.8,
    normalLevel: 2.5,
    alertLevel: 4.0,
    warningLevel: 5.5,
    dangerLevel: 6.5,
    trend: "rising",
    status: "danger",
    forecastHours: 2,
    lastUpdated: new Date().toISOString(),
    lat: 1.7348,
    lng: 103.9,
    rainfall24h: 198,
  },
  {
    id: "sg-terengganu",
    state: "Terengganu",
    district: "Kuala Terengganu",
    river: "Sungai Terengganu",
    level: 1.9,
    normalLevel: 1.5,
    alertLevel: 3.0,
    warningLevel: 4.5,
    dangerLevel: 6.0,
    trend: "stable",
    status: "normal",
    forecastHours: null,
    lastUpdated: new Date().toISOString(),
    lat: 5.3296,
    lng: 103.137,
    rainfall24h: 12,
  },
  {
    id: "sg-muda",
    state: "Kedah",
    district: "Baling",
    river: "Sungai Muda",
    level: 4.1,
    normalLevel: 2.0,
    alertLevel: 3.8,
    warningLevel: 5.0,
    dangerLevel: 6.5,
    trend: "rising",
    status: "alert",
    forecastHours: 8,
    lastUpdated: new Date().toISOString(),
    lat: 5.68,
    lng: 100.92,
    rainfall24h: 76,
  },
];

// Recalculate status dynamically
FLOOD_ZONES_DATA.forEach((z) => {
  z.status = computeStatus(z.level, z.alertLevel, z.warningLevel, z.dangerLevel);
});

export function getFloodSummary() {
  const danger = FLOOD_ZONES_DATA.filter((z) => z.status === "danger").length;
  const warning = FLOOD_ZONES_DATA.filter((z) => z.status === "warning").length;
  const alert = FLOOD_ZONES_DATA.filter((z) => z.status === "alert").length;
  const normal = FLOOD_ZONES_DATA.filter((z) => z.status === "normal").length;
  const upcomingFloods = FLOOD_ZONES_DATA.filter((z) => z.forecastHours !== null).length;

  return { danger, warning, alert, normal, upcomingFloods, total: FLOOD_ZONES_DATA.length };
}
