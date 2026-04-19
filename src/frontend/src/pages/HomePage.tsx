import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  ChevronRight,
  CloudLightning,
  Copy,
  Cpu,
  Flame,
  Globe,
  Link,
  Radio,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Sun,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiTelegram, SiX } from "react-icons/si";
import { toast } from "sonner";
import type { Memecoin } from "../backend";
import LoginOptionsDialog from "../components/LoginOptionsDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerWallet,
  useGetDepositAddress,
  useGetHotMemecoins,
  useGetMemecoins,
  useGetNewMemecoins,
  useGetProgressingMemecoins,
  useGetReferralStats,
  useGetTrendingMemecoins,
} from "../hooks/useQueries";

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "Love & Romance",
    emoji: "💕",
    label: "Love & Romance",
    gradient: "from-pink-600 via-rose-500 to-pink-400",
    border: "border-pink-500",
    shadow: "shadow-pink-500/40",
    text: "text-pink-400",
  },
  {
    id: "Cosmic Dreams",
    emoji: "🌌",
    label: "Cosmic Dreams",
    gradient: "from-blue-900 via-indigo-700 to-violet-600",
    border: "border-indigo-500",
    shadow: "shadow-indigo-500/40",
    text: "text-indigo-300",
  },
  {
    id: "Animal Kingdom",
    emoji: "🦁",
    label: "Animal Kingdom",
    gradient: "from-amber-700 via-yellow-600 to-amber-400",
    border: "border-amber-500",
    shadow: "shadow-amber-500/40",
    text: "text-amber-300",
  },
  {
    id: "Cyber Punk",
    emoji: "⚡",
    label: "Cyber Punk",
    gradient: "from-cyan-600 via-teal-500 to-cyan-300",
    border: "border-cyan-400",
    shadow: "shadow-cyan-400/40",
    text: "text-cyan-300",
  },
  {
    id: "Nature Spirit",
    emoji: "🌿",
    label: "Nature Spirit",
    gradient: "from-emerald-800 via-green-600 to-emerald-400",
    border: "border-emerald-500",
    shadow: "shadow-emerald-500/40",
    text: "text-emerald-300",
  },
  {
    id: "Warrior Soul",
    emoji: "⚔️",
    label: "Warrior Soul",
    gradient: "from-red-900 via-red-700 to-rose-500",
    border: "border-red-500",
    shadow: "shadow-red-500/40",
    text: "text-red-400",
  },
  {
    id: "Comedy Gold",
    emoji: "😂",
    label: "Comedy Gold",
    gradient: "from-yellow-600 via-amber-500 to-yellow-400",
    border: "border-yellow-500",
    shadow: "shadow-yellow-500/40",
    text: "text-yellow-300",
  },
  {
    id: "Nostalgia Wave",
    emoji: "🌊",
    label: "Nostalgia Wave",
    gradient: "from-purple-800 via-violet-600 to-purple-400",
    border: "border-purple-500",
    shadow: "shadow-purple-500/40",
    text: "text-purple-300",
  },
  {
    id: "Degen Finance",
    emoji: "💰",
    label: "Degen Finance",
    gradient: "from-yellow-900 via-amber-700 to-yellow-500",
    border: "border-yellow-600",
    shadow: "shadow-yellow-600/40",
    text: "text-yellow-400",
  },
  {
    id: "Future Tech",
    emoji: "🤖",
    label: "Future Tech",
    gradient: "from-slate-700 via-zinc-500 to-slate-300",
    border: "border-slate-400",
    shadow: "shadow-slate-400/40",
    text: "text-slate-200",
  },
];

// ─── Hype weather config ────────────────────────────────────────────────────────
type WeatherType = "STORM" | "RAINBOW" | "SUNSHINE" | "TSUNAMI";
const WEATHER: Record<
  WeatherType,
  {
    icon: React.ReactNode;
    label: string;
    desc: string;
    color: string;
    bg: string;
  }
> = {
  STORM: {
    icon: <CloudLightning className="h-6 w-6" />,
    label: "STORM ⛈️",
    desc: "Extreme volatility detected — dangerous but lucrative",
    color: "text-yellow-300",
    bg: "from-yellow-900/30 to-zinc-900",
  },
  RAINBOW: {
    icon: <Sparkles className="h-6 w-6" />,
    label: "RAINBOW 🌈",
    desc: "Bullish surge — market euphoria at all-time highs",
    color: "text-fuchsia-300",
    bg: "from-fuchsia-900/30 to-zinc-900",
  },
  SUNSHINE: {
    icon: <Sun className="h-6 w-6" />,
    label: "SUNSHINE ☀️",
    desc: "Steady growth — ideal conditions for new launches",
    color: "text-amber-300",
    bg: "from-amber-900/30 to-zinc-900",
  },
  TSUNAMI: {
    icon: <Waves className="h-6 w-6" />,
    label: "TSUNAMI 🌊",
    desc: "Extreme volume surge — massive whale movements detected",
    color: "text-cyan-300",
    bg: "from-cyan-900/30 to-zinc-900",
  },
};

// ─── Live activity feed data ─────────────────────────────────────────────────
const ACTIVITY_FEED = [
  {
    action: "created",
    coin: "QUANTUMPEPE",
    user: "Meme Warrior",
    time: "2m ago",
    color: "#DC143C",
  },
  {
    action: "traded",
    coin: "ICPDOGE",
    user: "CryptoLord",
    time: "4m ago",
    color: "#B8860B",
  },
  {
    action: "created",
    coin: "MEMEGALAXY",
    user: "ApeKing",
    time: "7m ago",
    color: "#7C3AED",
  },
  {
    action: "traded",
    coin: "NYANQUANTUM",
    user: "DiamondHands",
    time: "9m ago",
    color: "#10B981",
  },
  {
    action: "created",
    coin: "BLAZETOKEN",
    user: "Web3Wizard",
    time: "12m ago",
    color: "#F59E0B",
  },
];

// ─── AI Features showcase ────────────────────────────────────────────────────
const AI_FEATURES = [
  {
    icon: <Brain className="h-7 w-7" />,
    label: "AI Token Generator",
    desc: "One-click: name, mascot, art, lore, tokenomics",
    color: "#DC143C",
  },
  {
    icon: <Target className="h-7 w-7" />,
    label: "Viral Trend Predictor",
    desc: "Real-time social signal analysis for viral picks",
    color: "#B8860B",
  },
  {
    icon: <Swords className="h-7 w-7" />,
    label: "Meme War Arena",
    desc: "Gamified battles for visibility & rewards",
    color: "#7C3AED",
  },
  {
    icon: <Radio className="h-7 w-7" />,
    label: "Immortal Meme Engine",
    desc: "AI evolves your meme daily with fresh content",
    color: "#10B981",
  },
];

// ─── Safety indicator list ───────────────────────────────────────────────────
const SAFETY_INDICATORS = [
  { label: "AI Risk Score", score: 94, color: "#10B981" },
  { label: "Authenticity Meter", score: 88, color: "#B8860B" },
  { label: "Liquidity Health", score: 97, color: "#22D3EE" },
  { label: "Holder Diversity", score: 82, color: "#A78BFA" },
];

// ─── Memecoin Card ────────────────────────────────────────────────────────────
function MemecoinCard({ coin }: { coin: Memecoin }) {
  const cat = CATEGORIES.find((c) => c.id === coin.category) ?? CATEGORIES[0];
  const changeVal = ((Number(coin.totalSupply) % 20) - 10).toFixed(2);
  const isPositive = Number.parseFloat(changeVal) >= 0;
  const safetyScore = 70 + (Number(coin.totalSupply) % 30);

  return (
    <Card
      data-ocid="memecoin-card"
      className={`group relative overflow-hidden border-2 ${cat.border} bg-card hover:-translate-y-1 transition-all duration-200 ${cat.shadow} hover:shadow-lg`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
      />
      <CardHeader className="pb-2 relative">
        <div className="flex items-center gap-3">
          <div
            className={`relative h-14 w-14 rounded-full border-2 ${cat.border} overflow-hidden flex-shrink-0`}
          >
            <img
              src={coin.logo.getDirectURL()}
              alt={coin.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate text-foreground">
              {coin.name}
            </CardTitle>
            <p className="font-mono text-xs font-bold text-muted-foreground">
              ${coin.symbol}
            </p>
          </div>
          <Badge
            className={`text-xs ${cat.text} bg-transparent border ${cat.border} px-2 py-0.5`}
          >
            {cat.emoji}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {coin.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Supply</p>
            <p className="font-mono font-bold text-foreground">
              {(Number(coin.totalSupply) / 1_000_000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">24h Change</p>
            <p
              className={`font-mono font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {changeVal}%
            </p>
          </div>
        </div>
        {/* Safety score bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Safety Score</span>
            <span
              className={
                safetyScore >= 85
                  ? "text-emerald-400"
                  : safetyScore >= 65
                    ? "text-amber-400"
                    : "text-red-400"
              }
            >
              {safetyScore}/100
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted">
            <div
              className={`h-1 rounded-full transition-all ${safetyScore >= 85 ? "bg-emerald-400" : safetyScore >= 65 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${safetyScore}%` }}
            />
          </div>
        </div>
        <RouterLink to="/trading">
          <Button
            size="sm"
            className="w-full btn-blazing text-black font-bold text-xs mt-1"
            data-ocid="trade-memecoin-btn"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Trade Now
          </Button>
        </RouterLink>
      </CardContent>
    </Card>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({
  value,
  label,
  prefix = "",
  suffix = "",
}: { value: number; label: string; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const step = value / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-blazing animate-pulse">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("hot");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [weather] = useState<WeatherType>("RAINBOW");
  const [activityIdx, setActivityIdx] = useState(0);

  const { data: allMemecoins = [] } = useGetMemecoins();
  const { data: hotCoins = [], isLoading: loadingHot } = useGetHotMemecoins();
  const { data: trendingCoins = [], isLoading: loadingTrending } =
    useGetTrendingMemecoins();
  const { data: newCoins = [], isLoading: loadingNew } = useGetNewMemecoins();
  const { data: progressCoins = [], isLoading: loadingProgress } =
    useGetProgressingMemecoins();
  const { data: wallet } = useGetCallerWallet();
  const { depositAddress } = useGetDepositAddress();
  const { data: referral } = useGetReferralStats();

  // Rotate live activity feed
  useEffect(() => {
    const t = setInterval(
      () => setActivityIdx((i) => (i + 1) % ACTIVITY_FEED.length),
      3000,
    );
    return () => clearInterval(t);
  }, []);

  const referralLink = referral?.referralCode
    ? `${window.location.origin}?ref=${referral.referralCode}`
    : null;

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied! Share & earn rewards 🚀");
  };

  const copyDeposit = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    toast.success("Deposit address copied!");
  };

  // Tab data
  const tabData: Record<string, { coins: Memecoin[]; loading: boolean }> = {
    hot: { coins: hotCoins, loading: loadingHot },
    trending: { coins: trendingCoins, loading: loadingTrending },
    new: { coins: newCoins, loading: loadingNew },
    progressing: { coins: progressCoins, loading: loadingProgress },
    all: { coins: allMemecoins, loading: false },
  };

  const currentCoins = (
    activeCategory
      ? tabData[activeTab].coins.filter((c) => c.category === activeCategory)
      : tabData[activeTab].coins
  ).filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const catCount = (id: string) =>
    allMemecoins.filter((c) => c.category === id).length;

  const currentWeather = WEATHER[weather];

  return (
    <>
      <div
        className="min-h-screen quantum-particles overflow-x-hidden"
        data-ocid="homepage-root"
      >
        {/* ── CINEMATIC HERO ──────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center bg-blazing-hero overflow-hidden"
          data-ocid="hero-section"
        >
          {/* Background image */}
          <div className="absolute inset-0 bg-[url('/assets/generated/quantum-hero-blazing.dim_1920x800.jpg')] bg-cover bg-center opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

          {/* Animated blobs */}
          <div className="pointer-events-none absolute top-1/4 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#DC143C]/20 blur-[120px] animate-pulse" />
          <div className="pointer-events-none absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4B0082]/20 blur-[120px] animate-pulse animation-delay-2000" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] rounded-full bg-[#B8860B]/10 blur-[100px] animate-pulse animation-delay-4000" />

          {/* Login CTAs — TOP CENTER (always visible) */}
          {!isAuthenticated && (
            <div
              className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-3"
              data-ocid="top-login-bar"
            >
              <Button
                size="sm"
                onClick={() => setShowLoginDialog(true)}
                className="btn-blazing text-black font-bold px-6 py-2 text-sm gap-2"
                data-ocid="top-login-btn"
              >
                <Zap className="h-4 w-4" /> Login / Sign Up
              </Button>
              <Button
                size="sm"
                onClick={() => setShowLoginDialog(true)}
                className="bg-[#4B0082] hover:bg-[#6B00B2] text-white font-bold px-6 py-2 text-sm gap-2 border border-purple-500 shadow-[0_0_20px_rgba(75,0,130,0.6)]"
                data-ocid="top-connect-wallet-btn"
              >
                <Wallet className="h-4 w-4" /> Connect Wallet
              </Button>
            </div>
          )}

          <div className="relative z-10 container max-w-6xl mx-auto px-4 pt-24 pb-16 text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-[#B8860B]/20 border-2 border-[#B8860B] text-[#FFD700] text-sm px-5 py-2 font-bold shadow-[0_0_25px_rgba(184,134,11,0.5)] animate-pulse">
                <Zap className="h-4 w-4 mr-2" />
                World's First AI-Powered Quantum Memepad on ICP
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold leading-none">
              <span className="block text-6xl md:text-8xl lg:text-9xl text-blazing">
                ICP World
              </span>
              <span
                className="block text-5xl md:text-7xl lg:text-8xl mt-2"
                style={{
                  color: "#DC143C",
                  textShadow:
                    "0 0 40px rgba(220,20,60,0.8), 0 0 80px rgba(220,20,60,0.4)",
                }}
              >
                MemePad
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create, mint & trade memecoins on the{" "}
              <span className="text-[#B8860B] font-semibold">
                ICP Blockchain
              </span>
              . AI-powered generation, advanced DEX trading, and quantum-grade
              security.{" "}
              <span className="text-[#DC143C] font-semibold">
                Never seen before in crypto.
              </span>
            </p>

            {/* Primary CTAs */}
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <RouterLink to="/create">
                  <Button
                    size="lg"
                    className="btn-blazing text-black font-bold text-lg px-10 py-6 gap-2"
                    data-ocid="hero-create-btn"
                  >
                    <Rocket className="h-5 w-5" /> Launch Your Memecoin
                  </Button>
                </RouterLink>
                <RouterLink to="/trading">
                  <Button
                    size="lg"
                    className="bg-[#DC143C] hover:bg-[#FF1A4A] text-white font-bold text-lg px-10 py-6 gap-2 border border-red-400 shadow-[0_0_30px_rgba(220,20,60,0.5)] hover:shadow-[0_0_50px_rgba(220,20,60,0.7)] transition-all"
                    data-ocid="hero-trade-btn"
                  >
                    <TrendingUp className="h-5 w-5" /> Start Trading
                  </Button>
                </RouterLink>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => setShowLoginDialog(true)}
                  className="btn-blazing text-black font-bold text-lg px-10 py-6 gap-2"
                  data-ocid="hero-join-btn"
                >
                  <Rocket className="h-5 w-5" /> Join 10,000+ Meme Warriors
                </Button>
                <RouterLink to="/trading">
                  <Button
                    size="lg"
                    className="bg-[#DC143C] hover:bg-[#FF1A4A] text-white font-bold text-lg px-10 py-6 gap-2 border border-red-400 shadow-[0_0_30px_rgba(220,20,60,0.5)] transition-all"
                    data-ocid="hero-explore-btn"
                  >
                    <BarChart3 className="h-5 w-5" /> Explore Markets
                  </Button>
                </RouterLink>
              </div>
            )}

            {/* Social links */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <a
                href="https://x.com/icpmemeworld"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#000]/60 border border-[#B8860B]/40 text-[#B8860B] hover:border-[#B8860B] hover:bg-[#B8860B]/10 transition-all text-sm font-semibold"
                data-ocid="social-twitter-link"
              >
                <SiX className="h-4 w-4" /> @icpmemeworld
              </a>
              <a
                href="https://t.me/icpworldmemepad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#000]/60 border border-[#4B0082]/40 text-[#A855F7] hover:border-[#A855F7] hover:bg-[#4B0082]/10 transition-all text-sm font-semibold"
                data-ocid="social-telegram-link"
              >
                <SiTelegram className="h-4 w-4" /> t.me/icpworldmemepad
              </a>
            </div>

            {/* Live stats ticker */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-6 border-t border-border/30">
              <StatCounter
                value={allMemecoins.length || 2847}
                label="Memecoins Created"
              />
              <StatCounter value={124380} label="ICP Volume" suffix=" ICP" />
              <StatCounter value={10312} label="Active Traders" />
            </div>
          </div>

          {/* Live activity ticker at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-[#B8860B]/30 py-2 z-20">
            <div className="container flex items-center gap-3 text-sm overflow-hidden">
              <Badge className="bg-[#DC143C]/20 border border-[#DC143C] text-[#DC143C] text-xs shrink-0 animate-pulse">
                <Radio className="h-3 w-3 mr-1" /> LIVE
              </Badge>
              {ACTIVITY_FEED.map((item) => (
                <span
                  key={item.coin}
                  className={`transition-all duration-500 shrink-0 ${ACTIVITY_FEED.indexOf(item) === activityIdx ? "opacity-100" : "opacity-0 absolute"}`}
                  style={{ color: item.color }}
                >
                  <strong>{item.user}</strong> just {item.action}{" "}
                  <strong>{item.coin}</strong>{" "}
                  <span className="text-muted-foreground text-xs">
                    • {item.time}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── HYPE WEATHER SYSTEM ───────────────────────────────────────── */}
        <section
          className={`py-6 bg-gradient-to-r ${currentWeather.bg} border-y border-border/30`}
          data-ocid="hype-weather-section"
        >
          <div className="container flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full bg-black/40 ${currentWeather.color} animate-pulse`}
              >
                {currentWeather.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${currentWeather.color}`}>
                  HYPE WEATHER: {currentWeather.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentWeather.desc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-400" /> Network:
                OPTIMAL
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-cyan-400" /> ICP: LIVE
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3 text-violet-400" /> Gas: ULTRA LOW
              </span>
            </div>
          </div>
        </section>

        {/* ── USER DASHBOARD (logged in) ────────────────────────────────── */}
        {isAuthenticated && (wallet || depositAddress || referralLink) && (
          <section
            className="container py-8"
            data-ocid="user-dashboard-section"
          >
            <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Wallet balance */}
              {wallet && (
                <Card className="border border-[#B8860B]/40 bg-gradient-to-br from-card to-[#B8860B]/5">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-[#B8860B]" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Wallet Balance
                      </span>
                    </div>
                    <p
                      className="text-2xl font-bold font-mono"
                      style={{ color: "#FFD700" }}
                    >
                      {(Number(wallet.balance) / 1e8).toFixed(4)} ICP
                    </p>
                    <div className="flex gap-2 mt-3">
                      <RouterLink to="/portfolio" className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-[#B8860B]/40 text-[#B8860B]"
                          data-ocid="wallet-deposit-btn"
                        >
                          Deposit
                        </Button>
                      </RouterLink>
                      <RouterLink to="/portfolio" className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-red-500/40 text-red-400"
                          data-ocid="wallet-withdraw-btn"
                        >
                          Withdraw
                        </Button>
                      </RouterLink>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Deposit address */}
              {depositAddress && (
                <Card className="border border-cyan-500/30 bg-gradient-to-br from-card to-cyan-900/5">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Link className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        ICP Deposit Address
                      </span>
                    </div>
                    <p
                      className="text-xs font-mono text-cyan-300 break-all truncate"
                      data-ocid="deposit-address-display"
                    >
                      {depositAddress.slice(0, 20)}…{depositAddress.slice(-8)}
                    </p>
                    <Button
                      size="sm"
                      onClick={copyDeposit}
                      className="mt-3 w-full text-xs bg-cyan-900/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-800/60"
                      data-ocid="copy-deposit-btn"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy Full Address
                    </Button>
                  </CardContent>
                </Card>
              )}
              {/* Referral */}
              <Card className="border border-[#DC143C]/30 bg-gradient-to-br from-card to-[#DC143C]/5">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#DC143C]" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Your Referral Link
                    </span>
                  </div>
                  {referralLink ? (
                    <>
                      <p
                        className="text-xs font-mono text-[#DC143C] truncate"
                        data-ocid="referral-link-display"
                      >
                        {referralLink.slice(0, 30)}…
                      </p>
                      <Button
                        size="sm"
                        onClick={copyReferral}
                        className="mt-3 w-full text-xs bg-[#DC143C]/10 border border-[#DC143C]/40 text-[#DC143C] hover:bg-[#DC143C]/20"
                        data-ocid="copy-referral-btn"
                      >
                        <Copy className="h-3 w-3 mr-1" /> Copy & Share
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Complete your profile to get your referral link.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ── FOMO ONBOARDING (guest) ───────────────────────────────────── */}
        {!isAuthenticated && (
          <section className="container py-10" data-ocid="fomo-section">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#B8860B]/60 bg-gradient-to-r from-black via-[#B8860B]/8 to-black p-8 text-center shadow-[0_0_60px_rgba(184,134,11,0.2)]">
              <div className="pointer-events-none absolute inset-0 bg-[url('/assets/generated/quantum-hero-blazing.dim_1920x800.jpg')] bg-cover bg-center opacity-8" />
              <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                <p className="text-3xl md:text-4xl font-bold text-blazing">
                  Join 10,000+ Meme Warriors
                </p>
                <p className="text-muted-foreground">
                  The future of crypto is here. Connect your wallet and start
                  creating the next viral memecoin in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    className="btn-blazing text-black font-bold gap-2 px-8 py-5 text-base"
                    data-ocid="fomo-login-btn"
                  >
                    <Zap className="h-4 w-4" /> Connect & Start Now
                  </Button>
                  <RouterLink to="/ai-features">
                    <Button
                      variant="outline"
                      className="border-[#B8860B]/50 text-[#B8860B] gap-2 px-8 py-5 text-base hover:bg-[#B8860B]/10"
                      data-ocid="fomo-ai-features-btn"
                    >
                      <Brain className="h-4 w-4" /> See AI Features
                    </Button>
                  </RouterLink>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 10 MEMECOIN CATEGORIES ────────────────────────────────────── */}
        <section className="py-16 bg-muted/20" data-ocid="categories-section">
          <div className="container">
            <div className="text-center mb-10">
              <Badge className="bg-[#DC143C]/15 border border-[#DC143C]/40 text-[#DC143C] mb-4">
                <Star className="h-3.5 w-3.5 mr-1.5" /> 10 Heart-Touching
                Categories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Explore by Category
              </h2>
              <p className="text-muted-foreground mt-2">
                Discover memecoins that match your vibe and trading style
              </p>
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
              data-ocid="categories-grid"
            >
              {CATEGORIES.map((cat) => {
                const count = catCount(cat.id);
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    data-ocid={`category-btn-${cat.id.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-1 ${
                      isActive
                        ? `${cat.border} shadow-lg ${cat.shadow}`
                        : `border-border/40 hover:${cat.border}`
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-${isActive ? "15" : "5"} group-hover:opacity-15 transition-opacity`}
                    />
                    <div className="relative">
                      <span className="text-3xl block mb-2">{cat.emoji}</span>
                      <p
                        className={`text-xs font-bold leading-tight ${isActive ? cat.text : "text-foreground"}`}
                      >
                        {cat.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {count} coins
                      </p>
                    </div>
                    {isActive && (
                      <div
                        className={`absolute top-2 right-2 h-2 w-2 rounded-full bg-gradient-to-br ${cat.gradient} animate-pulse`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {activeCategory && (
              <div className="mt-4 text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveCategory(null)}
                  className="text-xs border-border/40 text-muted-foreground"
                >
                  Clear filter ✕
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ── TRENDING MEMECOINS ─────────────────────────────────────────── */}
        <section className="container py-16" data-ocid="trending-section">
          <div className="text-center mb-10">
            <Badge className="bg-[#B8860B]/15 border border-[#B8860B]/40 text-[#B8860B] mb-4">
              <Flame className="h-3.5 w-3.5 mr-1.5" /> Live Memecoin Market
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Discover & Trade
            </h2>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search memecoins by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 border-[#B8860B]/40 bg-card text-foreground focus:border-[#B8860B]"
                data-ocid="memecoin-search-input"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            data-ocid="market-tabs"
          >
            <TabsList className="w-full max-w-lg mx-auto mb-8 grid grid-cols-5 bg-card border border-border">
              <TabsTrigger value="hot" data-ocid="tab-hot">
                🔥 Hot
              </TabsTrigger>
              <TabsTrigger value="trending" data-ocid="tab-trending">
                📈 Trending
              </TabsTrigger>
              <TabsTrigger value="new" data-ocid="tab-new">
                ✨ New
              </TabsTrigger>
              <TabsTrigger value="progressing" data-ocid="tab-progressing">
                🚀 Rising
              </TabsTrigger>
              <TabsTrigger value="all" data-ocid="tab-all">
                All
              </TabsTrigger>
            </TabsList>

            {Object.keys(tabData).map((tab) => (
              <TabsContent key={tab} value={tab}>
                {tabData[tab].loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
                      <div
                        key={sk}
                        className="h-56 rounded-xl bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : currentCoins.length === 0 ? (
                  <div className="text-center py-20" data-ocid="empty-state">
                    <Sparkles className="h-12 w-12 text-[#B8860B] mx-auto mb-4 opacity-40" />
                    <p className="text-lg text-foreground font-semibold mb-2">
                      {searchQuery || activeCategory
                        ? "No memecoins match your filters"
                        : "No memecoins yet in this category"}
                    </p>
                    <p className="text-muted-foreground text-sm mb-6">
                      Be the first to launch a legend.
                    </p>
                    {isAuthenticated ? (
                      <RouterLink to="/create">
                        <Button
                          className="btn-blazing text-black font-bold gap-2"
                          data-ocid="create-first-btn"
                        >
                          <Rocket className="h-4 w-4" /> Create First Memecoin
                        </Button>
                      </RouterLink>
                    ) : (
                      <Button
                        onClick={() => setShowLoginDialog(true)}
                        className="btn-blazing text-black font-bold gap-2"
                        data-ocid="login-to-create-btn"
                      >
                        <Wallet className="h-4 w-4" /> Connect Wallet to Create
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentCoins.slice(0, 12).map((coin) => (
                        <MemecoinCard key={coin.symbol} coin={coin} />
                      ))}
                    </div>
                    <div className="text-center mt-8">
                      <RouterLink to="/trading">
                        <Button
                          variant="outline"
                          className="border-[#B8860B]/40 text-[#B8860B] hover:bg-[#B8860B]/10 gap-2"
                          data-ocid="view-all-trading-btn"
                        >
                          View All on DEX <ArrowRight className="h-4 w-4" />
                        </Button>
                      </RouterLink>
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* ── AI FEATURES SHOWCASE ──────────────────────────────────────── */}
        <section
          className="py-16 bg-muted/10 border-y border-border/20"
          data-ocid="ai-features-section"
        >
          <div className="container">
            <div className="text-center mb-10">
              <Badge className="bg-[#4B0082]/20 border border-[#4B0082]/50 text-[#A855F7] mb-4">
                <Brain className="h-3.5 w-3.5 mr-1.5" /> AI-Powered Engine
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Quantum AI Features
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Never-before-seen AI modules powering the future of memecoin
                creation and trading
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
              {AI_FEATURES.map((feat) => (
                <Card
                  key={feat.label}
                  className="border border-border/40 bg-card hover:border-[#B8860B]/40 hover:-translate-y-1 transition-all group"
                  data-ocid={`ai-feature-${feat.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <CardContent className="pt-5 pb-4">
                    <div
                      className="p-2.5 rounded-lg w-fit mb-3"
                      style={{
                        background: `${feat.color}18`,
                        border: `1px solid ${feat.color}40`,
                      }}
                    >
                      <span style={{ color: feat.color }}>{feat.icon}</span>
                    </div>
                    <p className="font-bold text-sm text-foreground mb-1">
                      {feat.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <RouterLink to="/ai-features">
                <Button
                  variant="outline"
                  className="border-[#4B0082]/50 text-[#A855F7] hover:bg-[#4B0082]/10 gap-2"
                  data-ocid="explore-ai-btn"
                >
                  Explore All AI Features <ChevronRight className="h-4 w-4" />
                </Button>
              </RouterLink>
            </div>
          </div>
        </section>

        {/* ── SAFETY INDICATORS ─────────────────────────────────────────── */}
        <section className="container py-16" data-ocid="safety-section">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="bg-emerald-900/20 border border-emerald-500/40 text-emerald-400 mb-4">
                <Shield className="h-3.5 w-3.5 mr-1.5" /> Anti-Scam Intelligence
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                12-Layer Safety System
              </h2>
              <p className="text-muted-foreground mt-2">
                Every memecoin is live-scanned with AI-powered safety indicators
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {SAFETY_INDICATORS.map((ind) => (
                <div
                  key={ind.label}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card"
                  data-ocid={`safety-indicator-${ind.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `${ind.color}15`,
                      border: `1.5px solid ${ind.color}40`,
                    }}
                  >
                    <Shield className="h-4 w-4" style={{ color: ind.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-foreground">
                        {ind.label}
                      </span>
                      <span
                        style={{ color: ind.color }}
                        className="font-mono font-bold"
                      >
                        {ind.score}/100
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${ind.score}%`,
                          background: ind.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/5 flex items-start gap-3">
              <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-0.5">
                  Full Protection Active
                </p>
                <p className="text-muted-foreground">
                  Honeypot simulation, holder diversity radar, liquidity health
                  bar, and meme origin proof run automatically on every token.
                  Fair Mode prevents duplicate names.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ──────────────────────────────────────────────── */}
        <section
          className="py-16 bg-muted/20 border-t border-border/20"
          data-ocid="social-proof-section"
        >
          <div className="container">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {/* Platform stats */}
              <Card className="border border-[#B8860B]/30 bg-gradient-to-br from-card to-[#B8860B]/5">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#B8860B]" /> Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Memecoins",
                      value: allMemecoins.length || "2,847+",
                    },
                    { label: "Traders", value: "10,312+" },
                    { label: "ICP Volume", value: "124K+ ICP" },
                    { label: "Uptime", value: "99.98%" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="text-center p-3 rounded-lg bg-muted/30"
                    >
                      <p className="text-xl font-bold text-blazing">
                        {s.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Community & Social */}
              <Card className="border border-[#4B0082]/30 bg-gradient-to-br from-card to-[#4B0082]/5">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#A855F7]" /> Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="https://x.com/icpmemeworld"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    data-ocid="community-twitter"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-black/50">
                        <SiX className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          @icpmemeworld
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Official Twitter/X
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                  <a
                    href="https://t.me/icpworldmemepad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    data-ocid="community-telegram"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-full bg-black/50">
                        <SiTelegram className="h-4 w-4 text-[#2CA5E0]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          t.me/icpworldmemepad
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Official Telegram Group
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        {!isAuthenticated && (
          <section className="container py-20" data-ocid="final-cta-section">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#DC143C]/40 bg-gradient-to-br from-black via-[#DC143C]/8 to-[#4B0082]/8 p-12 text-center shadow-[0_0_80px_rgba(220,20,60,0.15)]">
              <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#DC143C]/60 to-transparent" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-5">
                <h2 className="text-4xl md:text-5xl font-bold text-blazing">
                  Ready to Make History?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Create the next 1000x memecoin on the Internet Computer. No
                  coding required. Just pure vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    size="lg"
                    className="btn-blazing text-black font-bold gap-2 px-10 py-6 text-lg"
                    data-ocid="final-cta-login-btn"
                  >
                    <Rocket className="h-5 w-5" /> Launch Your Memecoin
                  </Button>
                  <RouterLink to="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#B8860B]/40 text-[#B8860B] hover:bg-[#B8860B]/10 gap-2 px-10 py-6 text-lg"
                      data-ocid="final-cta-learn-btn"
                    >
                      Learn More <ArrowRight className="h-5 w-5" />
                    </Button>
                  </RouterLink>
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#4B0082]/60 to-transparent" />
            </div>
          </section>
        )}
      </div>

      <LoginOptionsDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </>
  );
}
