import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Atom,
  Brain,
  ChevronRight,
  CloudLightning,
  Cpu,
  Globe,
  Heart,
  Infinity as InfinityIcon,
  Layers,
  Mic,
  MicOff,
  Palette,
  Play,
  RefreshCw,
  Rocket,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Sword,
  Theater,
  TrendingUp,
  Wand2,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Weather = "STORM" | "RAINBOW" | "SUNSHINE" | "TSUNAMI" | "BLIZZARD";
type RarityKey = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

interface GeneratedToken {
  name: string;
  symbol: string;
  lore: string;
  supply: string;
  tax: string;
  liquidity: string;
  mood: string;
  score: number;
}

// ─── Simulated AI data ────────────────────────────────────────────────────────
const AI_NAMES = [
  "QuantumDoge",
  "NyanPulsar",
  "CosmicPepe",
  "HyperFroge",
  "NebulaCat",
  "VortexApe",
  "PlasmaWolf",
  "CipherBull",
];
const AI_SYMBOLS = [
  "QDOGE",
  "NYAN",
  "CPEP",
  "HFRG",
  "NCA",
  "VAPE",
  "PLWLF",
  "CPHR",
];
const AI_LORES = [
  "Born from the quantum foam of the ICP blockchain, this entity transcends ordinary meme physics.",
  "Manifested from pure internet energy, its waves ripple across every chain simultaneously.",
  "An ancient meme god reawakened by AI, fused with ICP to become unstoppable.",
  "Forged in the quantum fire of a dying star, this coin carries the meme DNA of a thousand galaxies.",
];
const AI_MOODS = ["Bullish", "Degen", "Cosmic", "Cyber", "Viral", "Legendary"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateToken(): GeneratedToken {
  const idx = randomInt(0, AI_NAMES.length - 1);
  return {
    name: AI_NAMES[idx],
    symbol: AI_SYMBOLS[idx],
    lore: randomFrom(AI_LORES),
    supply: `${randomInt(100, 999)},000,000,000`,
    tax: `${randomInt(1, 5)}% buy / ${randomInt(1, 5)}% sell`,
    liquidity: `${randomInt(5, 20)}% locked ${randomInt(3, 12)} months`,
    mood: randomFrom(AI_MOODS),
    score: randomInt(72, 99),
  };
}

// ─── Weather ──────────────────────────────────────────────────────────────────
const WEATHER_DATA: Record<
  Weather,
  {
    emoji: string;
    color: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  STORM: {
    emoji: "⛈️",
    color: "from-slate-900 via-purple-900 to-slate-900",
    desc: "High volatility — extreme meme energy detected",
    icon: CloudLightning,
  },
  RAINBOW: {
    emoji: "🌈",
    color: "from-pink-900 via-purple-800 to-indigo-900",
    desc: "Multi-directional momentum — everything is pumping",
    icon: Sun,
  },
  SUNSHINE: {
    emoji: "☀️",
    color: "from-yellow-900 via-amber-800 to-orange-900",
    desc: "Golden run — AI predicts sustained upward pressure",
    icon: Sun,
  },
  TSUNAMI: {
    emoji: "🌊",
    color: "from-blue-950 via-cyan-900 to-blue-900",
    desc: "Massive wave incoming — prepare for mega volume surge",
    icon: Waves,
  },
  BLIZZARD: {
    emoji: "❄️",
    color: "from-slate-900 via-blue-900 to-indigo-950",
    desc: "Market freeze — accumulation phase detected by AI",
    icon: Snowflake,
  },
};
const WEATHERS: Weather[] = [
  "STORM",
  "RAINBOW",
  "SUNSHINE",
  "TSUNAMI",
  "BLIZZARD",
];

const TREND_THEMES = [
  { name: "Quantum Dogs", score: 96, emoji: "🐕", category: "Animal Kingdom" },
  { name: "AI Frogs", score: 91, emoji: "🐸", category: "Cyber Punk" },
  { name: "Space Cats", score: 88, emoji: "🐱", category: "Cosmic Dreams" },
  { name: "Dragon Degens", score: 84, emoji: "🐉", category: "Shadow Realm" },
  { name: "Neon Bulls", score: 79, emoji: "🐂", category: "Future Tech" },
];

const WAR_TOKENS = [
  { name: "QuantumDoge", symbol: "QDOGE", emoji: "⚡", votes: 2847 },
  { name: "CosmicPepe", symbol: "CPEP", emoji: "🌌", votes: 2341 },
  { name: "NyanPulsar", symbol: "NYAN", emoji: "🌈", votes: 1923 },
  { name: "HyperFroge", symbol: "HFRG", emoji: "🔥", votes: 1654 },
];

const LIVING_NFTS = [
  {
    name: "NovaDoge",
    stage: "Ascended",
    level: 5,
    traits: ["Quantum", "Cosmic", "Immortal"],
    emoji: "🌟",
    rarity: "Mythic" as RarityKey,
  },
  {
    name: "CipherCat",
    stage: "Evolved",
    level: 3,
    traits: ["Cyber", "Neural", "Stealth"],
    emoji: "🐱",
    rarity: "Legendary" as RarityKey,
  },
  {
    name: "PlasmaFrog",
    stage: "Awakened",
    level: 2,
    traits: ["Electric", "Degen"],
    emoji: "⚡",
    rarity: "Epic" as RarityKey,
  },
];

const RARITY_CONFIG: Record<
  RarityKey,
  { border: string; glow: string; badge: string; label: string }
> = {
  Common: {
    border: "border-muted-foreground/40",
    glow: "",
    badge: "bg-muted text-muted-foreground",
    label: "COMMON",
  },
  Rare: {
    border: "border-blue-500/60",
    glow: "shadow-blue-500/20",
    badge: "bg-blue-900/50 text-blue-300",
    label: "RARE",
  },
  Epic: {
    border: "border-purple-500/60",
    glow: "shadow-purple-500/30",
    badge: "bg-purple-900/50 text-purple-300",
    label: "EPIC",
  },
  Legendary: {
    border: "border-amber-400/70",
    glow: "shadow-amber-400/40",
    badge: "bg-amber-900/50 text-amber-300",
    label: "LEGENDARY",
  },
  Mythic: {
    border: "border-pink-400/70",
    glow: "shadow-pink-500/50",
    badge: "bg-pink-900/50 text-pink-300 animate-pulse",
    label: "MYTHIC ✦",
  },
};

const HOLO_CARDS = [
  {
    name: "QuantumDoge",
    symbol: "QDOGE",
    rarity: "Mythic" as RarityKey,
    emoji: "⚡",
    power: 9800,
    desc: "The genesis meme god",
  },
  {
    name: "CosmicPepe",
    symbol: "CPEP",
    rarity: "Legendary" as RarityKey,
    emoji: "🌌",
    power: 8400,
    desc: "Ancient frog oracle",
  },
  {
    name: "NyanPulsar",
    symbol: "NYAN",
    rarity: "Epic" as RarityKey,
    emoji: "🌈",
    power: 7200,
    desc: "Rainbow velocity node",
  },
  {
    name: "PlasmaWolf",
    symbol: "PLWLF",
    rarity: "Rare" as RarityKey,
    emoji: "🐺",
    power: 5600,
    desc: "Plasma chain hunter",
  },
  {
    name: "CipherBull",
    symbol: "CPHR",
    rarity: "Common" as RarityKey,
    emoji: "🐂",
    power: 3200,
    desc: "Entry-level warrior",
  },
];

const STORY_ARCS = [
  {
    title: "The Origin Story",
    preview: "🌌 In the beginning, there was nothing but quantum foam...",
  },
  {
    title: "The Great Meme War",
    preview: "⚔️ Two factions emerged from the blockchain void...",
  },
  {
    title: "Ascension Protocol",
    preview: "🚀 The chosen token was selected by the AI oracle...",
  },
  {
    title: "The Immortal Rug",
    preview: "💀 A legendary rugpull that became a martyr...",
  },
];

const EXTRA_FEATURES = [
  {
    icon: Brain,
    title: "AI Auto-Marketing Bot",
    tag: "LIVE",
    tagColor: "bg-green-500/20 text-green-400",
    desc: "Autonomously generates viral social posts, meme campaigns, and community hype waves for every new token.",
    stats: [
      { label: "Posts Today", value: "14,293" },
      { label: "Engagement", value: "8.7%" },
      { label: "Campaigns", value: "342" },
    ],
  },
  {
    icon: Activity,
    title: "Adaptive AI Tokenomics",
    tag: "ACTIVE",
    tagColor: "bg-cyan-500/20 text-cyan-400",
    desc: "Self-tuning supply curves, tax dynamics, reward multipliers, staking APY, and liquidity ratios based on real-time on-chain signals.",
    stats: [
      { label: "Tokens Optimized", value: "891" },
      { label: "APY Boost", value: "+23%" },
      { label: "Liquidity Saved", value: "$2.1M" },
    ],
  },
  {
    icon: Layers,
    title: "Multi-Sensory Launch Pages",
    tag: "LIVE",
    tagColor: "bg-green-500/20 text-green-400",
    desc: "Cinematic dopamine-triggering launch sequences with particle effects, confetti storms, and AI-composed cinematics.",
    stats: [
      { label: "Launches Powered", value: "2,047" },
      { label: "Time on Page", value: "4m 32s" },
      { label: "Conversion", value: "67%" },
    ],
  },
  {
    icon: Theater,
    title: "FOMO Onboarding Engine",
    tag: "LIVE",
    tagColor: "bg-green-500/20 text-green-400",
    desc: "Instant WOW effect cinematic welcome sequences. AI-crafted emotional hooks and psychologically optimized attention flows.",
    stats: [
      { label: "Users Onboarded", value: "48,291" },
      { label: "Retention", value: "89%" },
      { label: "FOMO Score", value: "99/100" },
    ],
  },
  {
    icon: Atom,
    title: "Animated Mascot Story Engine",
    tag: "LIVE",
    tagColor: "bg-green-500/20 text-green-400",
    desc: "AI mascots guide users through every interaction with personalized storylines, quest animations, and personality-driven tours.",
    stats: [
      { label: "Story Arcs", value: "9,812" },
      { label: "Mascots Active", value: "1,241" },
      { label: "Quests Done", value: "34.7K" },
    ],
  },
  {
    icon: Globe,
    title: "Holo-UI & 3D Moodboards",
    tag: "ACTIVE",
    tagColor: "bg-cyan-500/20 text-cyan-400",
    desc: "Futuristic 3D-style visual boards for memecoins with hologram-like interfaces, depth animations, and immersive dashboards.",
    stats: [
      { label: "Moodboards", value: "6,503" },
      { label: "3D Assets", value: "22K+" },
      { label: "Interactions", value: "190K/day" },
    ],
  },
];

const SOUL_COINS: Record<
  string,
  { name: string; symbol: string; trait: string }
> = {
  "Degen Trader": {
    name: "DegenPulsar",
    symbol: "DPLS",
    trait: "Chaos Magnet",
  },
  "HODL King": {
    name: "DiamondHands",
    symbol: "DMND",
    trait: "Immovable Force",
  },
  "Meme Creator": {
    name: "MemeForge",
    symbol: "MFRG",
    trait: "Viral Architect",
  },
  "Community Builder": {
    name: "HiveMind",
    symbol: "HIVE",
    trait: "Unity Engine",
  },
};
const QUIZ = [
  {
    q: "What describes you best?",
    opts: ["Degen Trader", "HODL King", "Meme Creator", "Community Builder"],
  },
  {
    q: "Favorite crypto vibe?",
    opts: ["Moon Mission", "Steady Gains", "Chaos & Fun", "Utility First"],
  },
  { q: "Spirit animal?", opts: ["Wolf 🐺", "Dog 🐕", "Frog 🐸", "Cat 🐱"] },
];

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  tag,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  tag?: string;
}) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          {title}
        </h2>
        {tag && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs font-bold">
            {tag}
          </Badge>
        )}
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm ml-12">{subtitle}</p>
      )}
    </div>
  );
}

export default function AIFeaturesPage() {
  const [generatedToken, setGeneratedToken] = useState<GeneratedToken>(
    generateToken(),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [concept, setConcept] = useState("");
  const [weather, setWeather] = useState<Weather>("STORM");
  const [forecast, setForecast] = useState<Weather[]>([
    "RAINBOW",
    "SUNSHINE",
    "TSUNAMI",
  ]);
  const [trends, setTrends] = useState(TREND_THEMES.map((t) => ({ ...t })));
  const [warVotes, setWarVotes] = useState(
    WAR_TOKENS.slice(0, 2).map((t) => ({ ...t })),
  );
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceResult, setVoiceResult] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(20).fill(10));
  const [quizStep, setQuizStep] = useState(0);
  const [_quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [soulCoin, setSoulCoin] = useState<{
    name: string;
    symbol: string;
    trait: string;
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState("#ff6b00");
  const [memeEnergy, setMemeEnergy] = useState("");
  const [storyArc, setStoryArc] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(86400);
  const waveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather((prev) => {
        const idx = WEATHERS.indexOf(prev);
        const next = WEATHERS[(idx + 1) % WEATHERS.length];
        setForecast([
          WEATHERS[(idx + 2) % 5],
          WEATHERS[(idx + 3) % 5],
          WEATHERS[(idx + 4) % 5],
        ]);
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrends((prev) =>
        prev.map((t) => ({
          ...t,
          score: Math.max(60, Math.min(99, t.score + randomInt(-2, 3))),
        })),
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => setCountdown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGeneratedToken(generateToken());
    setIsGenerating(false);
  }, []);

  const handleVoiceToggle = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      if (waveInterval.current) clearInterval(waveInterval.current);
      setTimeout(() => {
        setVoiceResult(
          'Creating "AstroPup" 🐾 — Space dog memecoin, APUP symbol, 500B supply, cosmic lore, bullish tokenomics. Ready to launch!',
        );
      }, 800);
    } else {
      setIsRecording(true);
      setVoiceResult(null);
      waveInterval.current = setInterval(() => {
        setWaveform(
          Array(20)
            .fill(0)
            .map(() => randomInt(5, 45)),
        );
      }, 100);
    }
  }, [isRecording]);

  const handleQuizAnswer = (ans: string) => {
    if (quizStep === 0)
      setSoulCoin(SOUL_COINS[ans] ?? SOUL_COINS["Degen Trader"]);
    if (quizStep < QUIZ.length - 1) {
      setQuizAnswers((prev) => [...prev, ans]);
      setQuizStep((q) => q + 1);
    } else {
      setQuizStep(QUIZ.length);
    }
  };

  const getColorEnergy = (hex: string) => {
    if (hex.startsWith("#f") || hex.startsWith("#e"))
      return "🔥 FIRE MEME — Explosive virality, aggressive community energy";
    if (hex.startsWith("#0") || hex.startsWith("#1"))
      return "💙 OCEAN MEME — Deep utility, calm accumulation cycle";
    return "🌟 GOLDEN MEME — Premium status, long-term holder loyalty";
  };

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const weatherData = WEATHER_DATA[weather];
  const WeatherIcon = weatherData.icon;
  const totalVotes = warVotes.reduce((s, t) => s + t.votes, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-purple-950/40 to-black border-b border-border py-16 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,oklch(0.45_0.18_310/0.15),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto text-center space-y-4">
          <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1.5 font-bold tracking-widest">
            ✦ 17 LIVE AI FEATURES ✦
          </Badge>
          <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-pink-400">
            AI Command Center
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The world's first fully autonomous AI memepad engine — every feature
            live, every module operational.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-20">
        {/* 1. TOKEN GENERATOR */}
        <section data-ocid="ai-token-generator">
          <SectionTitle
            icon={Wand2}
            title="AI Autonomous Token Generator"
            tag="LIVE"
            subtitle="Describe a concept or mood — AI generates the complete memecoin in seconds"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-primary/30 bg-card/80 space-y-4">
              <label
                htmlFor="concept-input"
                className="text-sm text-muted-foreground font-medium"
              >
                Enter a concept, mood, or idea:
              </label>
              <input
                id="concept-input"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. quantum space dog with laser eyes"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-primary text-primary-foreground font-bold h-12"
                data-ocid="generate-token-btn"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    AI Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Memecoin
                  </>
                )}
              </Button>
            </Card>
            <Card
              className={`p-6 border-amber-400/40 bg-card/80 space-y-3 transition-all duration-500 ${isGenerating ? "opacity-50 blur-sm" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  AI RESULT
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Generated
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <p className="font-bold text-xl text-foreground">
                    {generatedToken.name}
                  </p>
                  <p className="text-primary font-mono text-sm">
                    ${generatedToken.symbol}
                  </p>
                </div>
                <Badge className="ml-auto bg-amber-500/20 text-amber-300">
                  {generatedToken.mood}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{generatedToken.lore}"
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Supply", generatedToken.supply],
                  ["Tax", generatedToken.tax],
                  ["Liquidity", generatedToken.liquidity],
                  ["AI Score", `${generatedToken.score}/100`],
                ].map(([k, v]) => (
                  <div key={k} className="bg-muted/40 rounded p-2">
                    <span className="text-muted-foreground">{k}: </span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 2. VIRAL TREND PREDICTOR */}
        <section data-ocid="trend-predictor">
          <SectionTitle
            icon={TrendingUp}
            title="AI Viral Trend Predictor"
            tag="LIVE"
            subtitle="Real-time meme trend analysis — know what's going viral before it happens"
          />
          <Card className="p-6 border-border bg-card/80">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                🔴 Live — updating every 3 seconds
              </p>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse text-xs">
                ● BROADCASTING
              </Badge>
            </div>
            <div className="space-y-4">
              {trends.map((t, i) => (
                <div key={t.name} className="flex items-center gap-4">
                  <span className="text-muted-foreground font-mono text-sm w-4">
                    #{i + 1}
                  </span>
                  <span className="text-xl w-8">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-sm">
                        {t.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs">
                          {t.category}
                        </Badge>
                        <span className="font-bold text-primary text-sm">
                          {t.score}
                        </span>
                      </div>
                    </div>
                    <Progress value={t.score} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 3. 4D HOLOGRAPHIC CARDS */}
        <section data-ocid="holo-cards">
          <SectionTitle
            icon={Layers}
            title="4D Holographic Meme Cards"
            tag="LIVE"
            subtitle="Hover to activate parallax depth — click to expand"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HOLO_CARDS.map((card) => {
              const cfg = RARITY_CONFIG[card.rarity];
              const isHovered = hoveredCard === card.symbol;
              const isExpanded = expandedCard === card.symbol;
              return (
                <button
                  type="button"
                  key={card.symbol}
                  className={`relative cursor-pointer select-none transition-all duration-300 text-left w-full ${isExpanded ? "scale-110 z-10" : isHovered ? "scale-105" : ""}`}
                  onMouseEnter={() => setHoveredCard(card.symbol)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() =>
                    setExpandedCard((e) =>
                      e === card.symbol ? null : card.symbol,
                    )
                  }
                  style={{ perspective: "600px" }}
                >
                  <Card
                    className={`p-4 border-2 ${cfg.border} bg-card/90 shadow-lg ${cfg.glow} space-y-2 text-center transition-transform duration-300`}
                    style={{
                      transform: isHovered
                        ? "rotateY(8deg) rotateX(-4deg)"
                        : "none",
                    }}
                  >
                    <Badge
                      className={`${cfg.badge} border-0 text-xs font-bold w-full justify-center py-0.5`}
                    >
                      {cfg.label}
                    </Badge>
                    <div className="text-4xl my-2">{card.emoji}</div>
                    <p className="font-bold text-foreground text-sm">
                      {card.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      ${card.symbol}
                    </p>
                    {isExpanded && (
                      <div className="space-y-1 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          {card.desc}
                        </p>
                        <p className="text-xs text-primary font-bold">
                          PWR: {card.power.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </Card>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. HYPE WEATHER */}
        <section data-ocid="hype-weather">
          <SectionTitle
            icon={Wind}
            title="Hype Weather System"
            tag="LIVE"
            subtitle="AI-driven market mood visualization — updates every 30 seconds"
          />
          <Card
            className={`overflow-hidden border-border bg-gradient-to-br ${weatherData.color}`}
          >
            <div className="p-8 text-center space-y-4 relative">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative space-y-3">
                <div className="text-6xl animate-bounce">
                  {weatherData.emoji}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <WeatherIcon className="h-8 w-8 text-white" />
                  <h3 className="text-4xl font-display font-black text-white">
                    {weather}
                  </h3>
                </div>
                <p className="text-white/80 text-lg">{weatherData.desc}</p>
                <Badge className="bg-white/20 text-white border-white/30">
                  Market Mood Index: {randomInt(60, 95)}/100
                </Badge>
              </div>
            </div>
            <div className="bg-black/60 p-4 flex items-center justify-center gap-6 border-t border-white/10">
              <span className="text-white/60 text-sm font-medium">
                Forecast:
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {forecast[0] ? WEATHER_DATA[forecast[0]].emoji : ""}
                </span>
                <span className="text-white/60 text-xs">{forecast[0]}</span>
                <ChevronRight className="h-3 w-3 text-white/30 ml-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {forecast[1] ? WEATHER_DATA[forecast[1]].emoji : ""}
                </span>
                <span className="text-white/60 text-xs">{forecast[1]}</span>
                <ChevronRight className="h-3 w-3 text-white/30 ml-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">
                  {forecast[2] ? WEATHER_DATA[forecast[2]].emoji : ""}
                </span>
                <span className="text-white/60 text-xs">{forecast[2]}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* 5. MEME WAR ARENA */}
        <section data-ocid="meme-war-arena">
          <SectionTitle
            icon={Sword}
            title="Meme War Arena"
            tag="LIVE"
            subtitle="Gamified community battles — vote for the ultimate meme champion"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {warVotes.map((token, i) => (
              <Card
                key={token.symbol}
                className={`p-6 border ${i === 0 ? "border-red-500/40" : "border-blue-500/40"} bg-card/80 space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{token.emoji}</span>
                    <div>
                      <p className="font-bold text-foreground">{token.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        ${token.symbol}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      i === 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-blue-500/20 text-blue-400"
                    }
                  >
                    {token.votes.toLocaleString()} votes
                  </Badge>
                </div>
                <Progress
                  value={(token.votes / totalVotes) * 100}
                  className="h-3"
                />
                <Button
                  onClick={() => {
                    if (!votedFor) {
                      setVotedFor(token.symbol);
                      setWarVotes((prev) =>
                        prev.map((t) =>
                          t.symbol === token.symbol
                            ? { ...t, votes: t.votes + 1 }
                            : t,
                        ),
                      );
                    }
                  }}
                  disabled={!!votedFor}
                  variant={votedFor === token.symbol ? "secondary" : "outline"}
                  className="w-full"
                  data-ocid={`vote-btn-${token.symbol}`}
                >
                  {votedFor === token.symbol
                    ? "✅ You Voted!"
                    : votedFor
                      ? "Already Voted"
                      : `⚔️ Vote for ${token.name}`}
                </Button>
              </Card>
            ))}
          </div>
          <Card className="mt-4 p-4 border-border bg-card/60">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Battle Leaderboard
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WAR_TOKENS.map((t, i) => (
                <div key={t.symbol} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-4">#{i + 1}</span>
                  <span>{t.emoji}</span>
                  <span className="text-foreground text-xs">{t.name}</span>
                  <span className="ml-auto text-primary text-xs">
                    {t.votes.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 6. IMMORTAL MEME ENGINE */}
        <section data-ocid="immortal-meme">
          <SectionTitle
            icon={InfinityIcon}
            title="Immortal Meme Engine"
            tag="LIVE"
            subtitle="AI generates and evolves content daily — memes never die here"
          />
          <Card className="p-6 border-border bg-card/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Today's AI Content Drop
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Next update in:</span>
                <span className="font-mono text-primary font-bold">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  token: "QuantumDoge",
                  content:
                    '"The quantum foam remembers every moon. Every dip. Every hodler\'s prayer."',
                  type: "Daily Lore Drop",
                },
                {
                  token: "CosmicPepe",
                  content:
                    '"A new comic strip: Pepe discovers the lost blockchain of Atlantis, unlocking infinite liquidity."',
                  type: "Comic Release",
                },
                {
                  token: "NyanPulsar",
                  content:
                    '"Character Arc: NyanPulsar transforms from a basic cat into the cosmic deity of all rainbow chains."',
                  type: "Story Arc Update",
                },
              ].map((item) => (
                <Card
                  key={item.token}
                  className="p-4 border-purple-500/20 bg-muted/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">
                      {item.token}
                    </span>
                    <Badge className="bg-purple-500/10 text-purple-300 text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    {item.content}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        {/* 7. VOICE-TO-MEMECOIN */}
        <section data-ocid="voice-memecoin">
          <SectionTitle
            icon={Mic}
            title="Voice-to-Memecoin Interface"
            tag="LIVE"
            subtitle='Say: "Create a space dog coin called AstroPup" — watch AI build it live'
          />
          <Card className="p-8 border-border bg-card/80 text-center space-y-6">
            <button
              type="button"
              onClick={handleVoiceToggle}
              data-ocid="voice-record-btn"
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300 border-4 ${
                isRecording
                  ? "bg-red-500/20 border-red-500 shadow-lg shadow-red-500/30 scale-110 animate-pulse"
                  : "bg-primary/10 border-primary hover:bg-primary/20 hover:scale-105"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 text-red-400" />
              ) : (
                <Mic className="h-10 w-10 text-primary" />
              )}
            </button>
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-12">
                {waveform.map((h, i) => {
                  const wKey = String(i);
                  return (
                    <div
                      key={wKey}
                      className="bg-red-400 rounded-full w-1.5 transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              {isRecording
                ? "🔴 Listening... speak your memecoin idea"
                : "Click the microphone to start voice creation"}
            </p>
            {voiceResult && (
              <Card className="p-4 border-green-500/30 bg-green-500/5 text-left">
                <Badge className="bg-green-500/20 text-green-400 mb-2">
                  AI Parsed Result
                </Badge>
                <p className="text-sm text-foreground">{voiceResult}</p>
              </Card>
            )}
          </Card>
        </section>

        {/* 8. LIVING NFT ENGINE */}
        <section data-ocid="living-nft">
          <SectionTitle
            icon={Star}
            title="Living NFT Engine"
            tag="LIVE"
            subtitle="Animated AI mascots that evolve, gain traits, and interact with holders"
          />
          <div className="grid md:grid-cols-3 gap-4">
            {LIVING_NFTS.map((nft) => {
              const cfg = RARITY_CONFIG[nft.rarity];
              return (
                <Card
                  key={nft.name}
                  className={`p-5 border-2 ${cfg.border} bg-card/80 space-y-3 hover:scale-105 transition-transform duration-200`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{nft.emoji}</div>
                    <p className="font-bold text-foreground">{nft.name}</p>
                    <Badge className={`mt-1 ${cfg.badge} border-0 text-xs`}>
                      {nft.rarity}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Stage:</span>
                      <span className="text-primary font-medium">
                        {nft.stage}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="text-foreground">{nft.level}/5</span>
                    </div>
                    <Progress value={(nft.level / 5) * 100} className="h-1.5" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {nft.traits.map((t) => (
                      <Badge
                        key={t}
                        className="bg-accent/10 text-accent-foreground border-accent/20 text-xs"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 9. SYNESTHETIC EFFECTS */}
        <section data-ocid="synesthetic">
          <SectionTitle
            icon={Palette}
            title="Synesthetic Meme Effects"
            tag="LIVE"
            subtitle="Color-to-energy converter — every hue carries a unique meme frequency"
          />
          <Card className="p-6 border-border bg-card/80 grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label
                htmlFor="color-picker"
                className="text-sm text-muted-foreground"
              >
                Pick a meme energy color:
              </label>
              <input
                id="color-picker"
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  setMemeEnergy("");
                }}
                className="w-full h-16 rounded-lg cursor-pointer border-2 border-border bg-transparent"
              />
              <Button
                onClick={() => setMemeEnergy(getColorEnergy(selectedColor))}
                className="w-full"
                data-ocid="analyze-color-btn"
              >
                <Zap className="h-4 w-4 mr-2" /> Analyze Meme Energy
              </Button>
            </div>
            <div className="flex flex-col justify-center items-center gap-4">
              <div
                className="w-24 h-24 rounded-full border-4 border-border shadow-xl"
                style={{ backgroundColor: selectedColor }}
              />
              {memeEnergy ? (
                <Card className="p-3 border-border bg-muted/30 text-center">
                  <p className="text-sm text-foreground">{memeEnergy}</p>
                </Card>
              ) : (
                <p className="text-muted-foreground text-sm text-center">
                  Click "Analyze" to reveal the meme energy
                </p>
              )}
            </div>
          </Card>
        </section>

        {/* 10. SOUL-BOUND */}
        <section data-ocid="soul-bound">
          <SectionTitle
            icon={Heart}
            title="Soul-Bound Meme Generation"
            tag="LIVE"
            subtitle="Personalized memecoin built from your personality — no two are alike"
          />
          <Card className="p-6 border-border bg-card/80">
            {quizStep < QUIZ.length ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Progress
                    value={(quizStep / QUIZ.length) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {quizStep + 1}/{QUIZ.length}
                  </span>
                </div>
                <p className="text-lg font-medium text-foreground">
                  {QUIZ[quizStep].q}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {QUIZ[quizStep].opts.map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      onClick={() => handleQuizAnswer(opt)}
                      className="h-12 text-sm"
                      data-ocid={`quiz-opt-${opt.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : soulCoin ? (
              <div className="text-center space-y-4">
                <div className="text-5xl">✨</div>
                <p className="text-muted-foreground text-sm">
                  Your Soul-Bound Memecoin:
                </p>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {soulCoin.name}
                  </p>
                  <p className="text-primary font-mono">${soulCoin.symbol}</p>
                  <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">
                    {soulCoin.trait}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuizStep(0);
                    setQuizAnswers([]);
                    setSoulCoin(null);
                  }}
                  data-ocid="retake-quiz-btn"
                >
                  Retake Quiz
                </Button>
              </div>
            ) : null}
          </Card>
        </section>

        {/* 11. MEME UNIVERSE ENGINE */}
        <section data-ocid="meme-universe">
          <SectionTitle
            icon={Rocket}
            title="AI Meme Universe Engine"
            tag="LIVE"
            subtitle="AI-generated comics, story arcs, lore, and animations for every token"
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-5 border-border bg-card/80 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Select Story Arc:
              </p>
              <div className="space-y-2">
                {STORY_ARCS.map((arc, i) => (
                  <button
                    type="button"
                    key={arc.title}
                    onClick={() => setStoryArc(i)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${storyArc === i ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                    data-ocid={`story-arc-${i}`}
                  >
                    {arc.title}
                  </button>
                ))}
              </div>
            </Card>
            <Card className="p-5 border-primary/30 bg-card/80 space-y-3">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                Comic Preview
              </Badge>
              <div className="bg-muted/30 rounded-lg p-4 min-h-28 flex items-center justify-center border border-border/50">
                <p className="text-foreground text-sm italic text-center leading-relaxed">
                  {STORY_ARCS[storyArc].preview}
                  <br />
                  <span className="text-muted-foreground text-xs mt-2 block">
                    ...full AI-generated comic available on launch
                  </span>
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                data-ocid="generate-comic-btn"
              >
                <Play className="h-4 w-4 mr-2" /> Generate Full Comic
              </Button>
            </Card>
          </div>
        </section>

        {/* 12-17. EXTRA AI MODULES */}
        <section data-ocid="extra-ai-features">
          <SectionTitle
            icon={Cpu}
            title="More Live AI Modules"
            subtitle="Every module operational and processing real-time data"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXTRA_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card
                  key={feat.title}
                  className="p-5 border-border bg-card/80 hover:border-primary/40 transition-colors space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        {feat.title}
                      </p>
                    </div>
                    <Badge
                      className={`${feat.tagColor} border-0 text-xs shrink-0`}
                    >
                      {feat.tag}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {feat.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-muted/30 rounded p-2 text-center"
                      >
                        <p className="text-primary font-bold text-xs">
                          {s.value}
                        </p>
                        <p className="text-muted-foreground text-xs leading-tight mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
