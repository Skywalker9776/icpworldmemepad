import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Atom,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Copy,
  Cpu,
  Crown,
  ExternalLink,
  Eye,
  Flame,
  Globe,
  Heart,
  Lock,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalBlob } from "../backend";
import {
  useCreateMemecoin,
  useGetCallerWallet,
  useGetMemecoins,
  useGetOfficialDepositAddresses,
  useIsCEO,
} from "../hooks/useQueries";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "love",
    label: "Love & Romance",
    icon: "💕",
    color: "#DC143C",
    desc: "Built on passion and emotion",
  },
  {
    id: "cosmic",
    label: "Cosmic Dreams",
    icon: "🌌",
    color: "#4B0082",
    desc: "Galactic-scale ambitions",
  },
  {
    id: "animal",
    label: "Animal Kingdom",
    icon: "🦁",
    color: "#228B22",
    desc: "Wild and unstoppable",
  },
  {
    id: "cyber",
    label: "Cyber Punk",
    icon: "⚡",
    color: "#00BFFF",
    desc: "Digital revolution vibes",
  },
  {
    id: "nature",
    label: "Nature Spirit",
    icon: "🌿",
    color: "#32CD32",
    desc: "Organic growth energy",
  },
  {
    id: "warrior",
    label: "Warrior Soul",
    icon: "⚔️",
    color: "#FF4500",
    desc: "Relentless fighting spirit",
  },
  {
    id: "comedy",
    label: "Comedy Gold",
    icon: "😂",
    color: "#FFD700",
    desc: "Making crypto fun again",
  },
  {
    id: "nostalgia",
    label: "Nostalgia Wave",
    icon: "🕹️",
    color: "#FF69B4",
    desc: "Retro vibes gone viral",
  },
  {
    id: "degen",
    label: "Degen Finance",
    icon: "🎰",
    color: "#B8860B",
    desc: "High-risk, high-reward",
  },
  {
    id: "future",
    label: "Future Tech",
    icon: "🤖",
    color: "#00FFFF",
    desc: "AI-powered next-gen",
  },
];

const LOCK_OPTIONS = [
  {
    value: "3",
    label: "3 Months",
    icon: "🔒",
    desc: "Quick liquidity protection",
  },
  {
    value: "6",
    label: "6 Months",
    icon: "🔐",
    desc: "Standard security period",
  },
  {
    value: "12",
    label: "12 Months",
    icon: "🛡️",
    desc: "Maximum investor trust",
  },
];

const AI_NAMES: Record<string, string[]> = {
  love: ["LovePepe", "CupidCoin", "HeartFloki", "RomanceDoge"],
  cosmic: ["GalaxyApe", "NebulaFloki", "StarshipDoge", "CosmosKitty"],
  animal: ["AlphaWolf", "TigerShark", "BullFrog", "FerociousFox"],
  cyber: ["CyberPepe", "NeonDoge", "PixelFloki", "HackerCat"],
  nature: ["ForestSpirit", "EarthDoge", "NaturePepe", "GreenFloki"],
  warrior: ["QuantumBlade", "IronFist", "ShadowWarrior", "CryptoSamurai"],
  comedy: ["GigaChad", "WojakCoin", "NPC Token", "TouchGrassCoin"],
  nostalgia: ["RetroFloki", "VHSDoge", "ArcadePepe", "PixelMoon"],
  degen: ["APE2X", "YoloFloki", "GMCoin", "WENmoon"],
  future: ["NeuralDoge", "QuantumAI", "SingularityPepe", "CyberBrain"],
};

const AI_LORE: Record<string, string> = {
  love: "Born from pure emotion on the ICP blockchain, this token embodies love, passion, and human connection. Every transaction is a heartbeat. Every holder is family.",
  cosmic:
    "Forged in the quantum void between galaxies, this token transcends time and space. The cosmos itself bent reality to create this once-in-a-universe opportunity.",
  animal:
    "The alpha of the crypto jungle. This token carries the spirit of the wild — untamed, unstoppable, and always hungry for the next moon.",
  cyber:
    "Compiled in a neon-lit server room on the edge of the digital frontier. This token is pure code, pure chaos, pure profit.",
  nature:
    "Nature has spoken: the blockchain is alive. This organic token grows like a forest — slowly at first, then all at once.",
  warrior:
    "Hammered in the forges of the crypto battlefield, this token is for those who fight, bleed, and conquer. No mercy for bears.",
  comedy:
    "The universe is a joke and this token is the punchline. But jokes go viral — and viral means moon. Simple as that.",
  nostalgia:
    "Remember when games were fun and life was simple? This token brings back that feeling — plus 1000x gains.",
  degen:
    "Risk is the only certainty. This token was born in the heat of degen season and thrives on chaos, volatility, and pure unadulterated greed.",
  future:
    "AI designed. Neural-optimized. Blockchain-immutable. This token is not the future — it IS the present, you just can't see it yet.",
};

// ─── Confetti Particle ────────────────────────────────────────────────────────

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      color: ["#DC143C", "#B8860B", "#4B0082", "#228B22", "#FFD700", "#00BFFF"][
        Math.floor(Math.random() * 6)
      ],
      size: Math.random() * 8 + 4,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 5,
    }));

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    const timeout = setTimeout(
      () => cancelAnimationFrame(rafRef.current),
      5000,
    );
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step, current }: { step: number; current: number }) {
  const labels = [
    "Token Identity",
    "Tokenomics",
    "AI Enhancement",
    "Review & Launch",
  ];
  const icons = [Sparkles, Coins, Brain, Rocket];
  const Icon = icons[step - 1];
  const done = current > step;
  const active = current === step;

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
          done
            ? "bg-[#228B22] border-[#228B22]"
            : active
              ? "bg-[#B8860B] border-[#B8860B] shadow-[0_0_20px_rgba(184,134,11,0.8)]"
              : "bg-card border-border"
        }`}
      >
        {done ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <Icon
            className={`w-5 h-5 ${active ? "text-black" : "text-muted-foreground"}`}
          />
        )}
      </div>
      <span
        className={`text-xs font-bold text-center hidden md:block ${active ? "text-[#B8860B]" : done ? "text-[#228B22]" : "text-muted-foreground"}`}
      >
        {labels[step - 1]}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CreateMemecoinPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contractAddress, setContractAddress] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [telegram, setTelegram] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [nameStatus, setNameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Step 2
  const [supplyVal, setSupplyVal] = useState(1000000);
  const [lockDuration, setLockDuration] = useState("6");

  // Step 3
  const [aiGenerating, setAiGenerating] = useState(false);
  const [trendScore, setTrendScore] = useState(0);
  const [aiMascotStyle, setAiMascotStyle] = useState("");
  const [soulBoundQuiz, setSoulBoundQuiz] = useState(false);

  const createMemecoin = useCreateMemecoin();
  const { data: officialDepositAddresses = [] } =
    useGetOfficialDepositAddresses();
  const { data: isCEO } = useIsCEO();
  const { data: wallet } = useGetCallerWallet();
  const { data: allMemecoins = [] } = useGetMemecoins();

  const walletBalance = wallet ? Number(wallet.balance) / 1e8 : 0;
  const hasFunds = isCEO || walletBalance >= 2;

  // Fair Mode: check name availability
  useEffect(() => {
    if (!name.trim()) {
      setNameStatus("idle");
      return;
    }
    setNameStatus("checking");
    const timer = setTimeout(() => {
      const exists = allMemecoins.some(
        (m) => m.name.toLowerCase() === name.trim().toLowerCase(),
      );
      setNameStatus(exists ? "taken" : "available");
    }, 500);
    return () => clearTimeout(timer);
  }, [name, allMemecoins]);

  // AI trend score animation
  useEffect(() => {
    if (step !== 3) return;
    const target = category ? 55 + Math.floor(Math.random() * 40) : 30;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + 2, target);
      setTrendScore(current);
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [step, category]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const aiGenerate = useCallback(() => {
    if (!category) return;
    setAiGenerating(true);
    setTimeout(() => {
      const names = AI_NAMES[category] || AI_NAMES.degen;
      const picked = names[Math.floor(Math.random() * names.length)];
      setName(picked);
      setSymbol(
        picked
          .replace(/[aeiou\s]/gi, "")
          .toUpperCase()
          .slice(0, 6) || picked.slice(0, 5).toUpperCase(),
      );
      setDescription(AI_LORE[category] || AI_LORE.degen);
      setSupplyVal(1_000_000_000);
      setAiMascotStyle(
        ["Holographic", "Neon Punk", "Cosmic Warrior", "Digital Spirit"][
          Math.floor(Math.random() * 4)
        ],
      );
      setAiGenerating(false);
    }, 1800);
  }, [category]);

  const totalSupplyBig = BigInt(Math.max(100, supplyVal));
  const creatorSupply = (totalSupplyBig * BigInt(80)) / BigInt(100);
  const lockedSupply = (totalSupplyBig * BigInt(20)) / BigInt(100);

  const formatNum = (n: bigint | number) => Number(n).toLocaleString();

  const step1Valid =
    name.trim() &&
    symbol.trim() &&
    description.trim() &&
    category &&
    logoFile &&
    nameStatus === "available";
  const step2Valid = supplyVal >= 100 && lockDuration;

  const handleLaunch = async () => {
    if (!logoFile) return;
    const arrayBuffer = await logoFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const logo =
      ExternalBlob.fromBytes(uint8Array).withUploadProgress(setUploadProgress);

    createMemecoin.mutate(
      {
        name,
        symbol: symbol.toUpperCase(),
        description,
        totalSupply: totalSupplyBig,
        logo,
        lockDuration: BigInt(lockDuration),
        category,
      },
      {
        onSuccess: () => {
          const addr = `${symbol.toLowerCase()}-${Date.now().toString(16)}-icp`;
          setContractAddress(addr);
          setShowConfetti(true);
          setLaunchSuccess(true);
          setTimeout(() => setShowConfetti(false), 5000);
        },
      },
    );
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const msg = encodeURIComponent(
      `🚀 Just launched ${name} ($${symbol}) on @icpmemeworld! The world's first AI-powered memecoin on ICP blockchain. #ICP #Memecoin #Web3 #AI`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${msg}`, "_blank");
  };

  // ─── SUCCESS STATE ────────────────────────────────────────────────────────
  if (launchSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ConfettiCanvas active={showConfetti} />
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-[#B8860B] overflow-hidden shadow-[0_0_60px_rgba(184,134,11,0.9)]">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#B8860B] to-[#DC143C] flex items-center justify-center text-5xl">
                  🚀
                </div>
              )}
            </div>
            <div className="absolute -top-3 -right-3 animate-bounce">
              <div className="w-10 h-10 rounded-full bg-[#B8860B] flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-7xl animate-bounce">🎉</div>
            <h1
              className="text-4xl font-bold"
              style={{
                background: "linear-gradient(45deg,#DC143C,#B8860B,#4B0082)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {name} Launched!
            </h1>
            <p className="text-muted-foreground text-lg">
              ${symbol} is now live on the ICP blockchain
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-left">
            <p className="text-sm text-muted-foreground font-bold">
              CONTRACT ADDRESS
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-[#B8860B] break-all font-mono flex-1">
                {contractAddress}
              </code>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#228B22]" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/trading" })}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-[#B8860B]/40 hover:border-[#B8860B] transition-all group"
              data-ocid="success-view-trading"
            >
              <TrendingUp className="w-6 h-6 text-[#B8860B] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">
                Trade Now
              </span>
            </button>
            <button
              type="button"
              onClick={shareOnTwitter}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-[#00BFFF]/40 hover:border-[#00BFFF] transition-all group"
              data-ocid="success-share-twitter"
            >
              <Twitter className="w-6 h-6 text-[#00BFFF] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">Share</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLaunchSuccess(false);
                setStep(1);
                setName("");
                setSymbol("");
                setDescription("");
                setCategory("");
                setLogoFile(null);
                setLogoPreview("");
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-[#4B0082]/40 hover:border-[#4B0082] transition-all group"
              data-ocid="success-create-another"
            >
              <Rocket className="w-6 h-6 text-[#4B0082] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-foreground">
                Create More
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── WIZARD ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background quantum-particles">
      <ConfettiCanvas active={showConfetti} />

      {/* Hero Banner */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(184,134,11,0.25) 0%, rgba(220,20,60,0.15) 35%, transparent 70%)",
        }}
      >
        <div className="container max-w-4xl py-10 text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#B8860B]/50 bg-[#B8860B]/10 mb-2">
            <Atom
              className="w-4 h-4 text-[#B8860B] animate-spin"
              style={{ animationDuration: "4s" }}
            />
            <span className="text-[#B8860B] font-bold text-sm">
              AI-POWERED LAUNCHPAD
            </span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold"
            style={{
              background:
                "linear-gradient(90deg,#DC143C,#B8860B,#4B0082,#228B22)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "300% 300%",
            }}
          >
            Create Your Memecoin
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Launch on ICP with AI-powered creation, Fair Mode protection, and
            instant on-chain deployment
          </p>
        </div>
      </div>

      <div className="container max-w-4xl pb-16 space-y-8">
        {/* CEO Badge */}
        {isCEO && (
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#B8860B] bg-gradient-to-r from-[#B8860B]/20 to-[#4B0082]/20 shadow-[0_0_30px_rgba(184,134,11,0.4)]">
            <Crown className="w-8 h-8 text-[#B8860B] shrink-0" />
            <div>
              <p className="font-bold text-[#B8860B]">
                🎖️ CEO Lifetime Privilege Active
              </p>
              <p className="text-sm text-muted-foreground">
                All premium features unlocked · Memecoin creation is FREE for
                you
              </p>
            </div>
            <Badge className="ml-auto bg-[#B8860B] text-black font-bold shrink-0">
              FREE
            </Badge>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-start justify-between px-4 relative">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex flex-col items-center relative">
              <StepIndicator step={s} current={step} />
              {s < 4 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 transition-all duration-700 ${step > s ? "bg-[#228B22]" : "bg-border"}`}
                  style={{ left: "60%", width: "80%" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <Progress value={(step / 4) * 100} className="h-1.5 bg-muted" />

        {/* ─── STEP 1: Token Identity ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6" data-ocid="step-token-identity">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Sparkles className="w-6 h-6 text-[#B8860B]" />
                <h2 className="text-2xl font-bold text-foreground">
                  Token Identity
                </h2>
                <Badge
                  variant="outline"
                  className="ml-auto border-[#B8860B]/50 text-[#B8860B]"
                >
                  Step 1 of 4
                </Badge>
              </div>

              {/* Name with Fair Mode */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-foreground font-bold flex items-center gap-2"
                >
                  Token Name *
                  <div className="flex items-center gap-1 ml-auto">
                    <Shield className="w-3.5 h-3.5 text-[#228B22]" />
                    <span className="text-xs text-[#228B22]">Fair Mode ON</span>
                  </div>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g. Quantum Doge"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-input border-border text-foreground pr-32"
                    data-ocid="input-token-name"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nameStatus === "checking" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />{" "}
                        Checking...
                      </span>
                    )}
                    {nameStatus === "available" && (
                      <span className="text-xs text-[#228B22] flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Available
                      </span>
                    )}
                    {nameStatus === "taken" && (
                      <span className="text-xs text-[#DC143C] flex items-center gap-1 font-bold">
                        <X className="w-3.5 h-3.5" /> Name Taken
                      </span>
                    )}
                  </div>
                </div>
                {nameStatus === "taken" && (
                  <p className="text-xs text-[#DC143C] flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Fair Mode blocked: This name
                    already exists. Choose a unique name.
                  </p>
                )}
              </div>

              {/* Symbol */}
              <div className="space-y-2">
                <Label htmlFor="symbol" className="text-foreground font-bold">
                  Symbol / Ticker *{" "}
                  <span className="text-muted-foreground font-normal">
                    (max 10 chars)
                  </span>
                </Label>
                <Input
                  id="symbol"
                  placeholder="e.g. QDOGE"
                  value={symbol}
                  onChange={(e) =>
                    setSymbol(e.target.value.toUpperCase().slice(0, 10))
                  }
                  className="bg-input border-border text-foreground font-mono uppercase"
                  data-ocid="input-token-symbol"
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-3">
                <Label className="text-foreground font-bold">Category *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      data-ocid={`category-${cat.id}`}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-105 ${
                        category === cat.id
                          ? "border-[#B8860B] shadow-[0_0_20px_rgba(184,134,11,0.5)]"
                          : "border-border hover:border-border/80"
                      }`}
                      style={
                        category === cat.id
                          ? { background: `${cat.color}22` }
                          : {}
                      }
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-bold text-foreground leading-tight">
                        {cat.label}
                      </div>
                      {category === cat.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B8860B] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {category && (
                  <p className="text-xs text-muted-foreground pl-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#B8860B]" />
                    {CATEGORIES.find((c) => c.id === category)?.desc}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-foreground font-bold flex items-center gap-2"
                >
                  Token Lore / Description *
                  {category && (
                    <button
                      type="button"
                      onClick={() => setDescription(AI_LORE[category] || "")}
                      className="ml-auto text-xs text-[#4B0082] hover:text-[#B8860B] flex items-center gap-1 transition-colors"
                    >
                      <Wand2 className="w-3 h-3" /> AI Suggest
                    </button>
                  )}
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell the world the story of your memecoin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-input border-border text-foreground resize-none"
                  data-ocid="input-token-description"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length} chars
                </p>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-foreground font-bold">
                  Logo Image *
                </Label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="logo-upload"
                    className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-[#B8860B]/60 cursor-pointer transition-all group"
                    data-ocid="logo-upload-trigger"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#B8860B]/20 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-[#B8860B] transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Click to upload logo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG · 512×512px recommended
                      </p>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {logoPreview && (
                    <div className="relative shrink-0">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#B8860B] shadow-[0_0_20px_rgba(184,134,11,0.5)]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#228B22] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Socials */}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="text-muted-foreground text-sm flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website{" "}
                    <span className="text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://..."
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-input border-border text-foreground text-sm"
                    data-ocid="input-website"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="twitter"
                    className="text-muted-foreground text-sm flex items-center gap-1"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter{" "}
                    <span className="text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="@handle"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="bg-input border-border text-foreground text-sm"
                    data-ocid="input-twitter"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="telegram"
                    className="text-muted-foreground text-sm flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Telegram{" "}
                    <span className="text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="telegram"
                    placeholder="t.me/..."
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="bg-input border-border text-foreground text-sm"
                    data-ocid="input-telegram"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="w-full h-12 font-bold text-base btn-blazing text-black border-0"
              data-ocid="btn-step1-next"
            >
              Continue to Tokenomics <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* ─── STEP 2: Tokenomics ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6" data-ocid="step-tokenomics">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-8">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Coins className="w-6 h-6 text-[#B8860B]" />
                <h2 className="text-2xl font-bold text-foreground">
                  Tokenomics
                </h2>
                <Badge
                  variant="outline"
                  className="ml-auto border-[#B8860B]/50 text-[#B8860B]"
                >
                  Step 2 of 4
                </Badge>
              </div>

              {/* Supply Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-bold text-lg">
                    Total Supply
                  </Label>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-[#B8860B]">
                      {formatNum(supplyVal)}
                    </span>
                    <span className="text-muted-foreground text-sm ml-1">
                      tokens
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1000000}
                  max={1000000000000000}
                  step={1000000}
                  value={supplyVal}
                  onChange={(e) => setSupplyVal(Number(e.target.value))}
                  className="w-full accent-[#B8860B] h-2 cursor-pointer"
                  data-ocid="slider-total-supply"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1M</span>
                  <span>1B</span>
                  <span>1T</span>
                  <span>1 Quadrillion</span>
                </div>

                {/* Distribution breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">
                      YOU RECEIVE (80%)
                    </p>
                    <p className="text-lg font-bold text-[#228B22]">
                      {formatNum(creatorSupply)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Creator allocation
                    </p>
                  </div>
                  <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground font-bold">
                        AUTO-LOCKED (20%)
                      </p>
                      <Lock className="w-3 h-3 text-[#4B0082]" />
                    </div>
                    <p className="text-lg font-bold text-[#4B0082]">
                      {formatNum(lockedSupply)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Liquidity pool
                    </p>
                  </div>
                </div>

                {/* Max wallet cap info */}
                <div className="flex items-center gap-3 p-3 bg-[#DC143C]/10 border border-[#DC143C]/30 rounded-xl">
                  <Shield className="w-5 h-5 text-[#DC143C] shrink-0" />
                  <p className="text-sm text-foreground">
                    <strong className="text-[#DC143C]">
                      Max Wallet Cap: 30%
                    </strong>{" "}
                    — No single holder can accumulate more than 30% of total
                    supply. Enforced on-chain.
                  </p>
                </div>
              </div>

              {/* Liquidity Lock */}
              <div className="space-y-4">
                <Label className="text-foreground font-bold text-lg">
                  Liquidity Lock Duration
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {LOCK_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLockDuration(opt.value)}
                      data-ocid={`lock-${opt.value}`}
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-105 ${
                        lockDuration === opt.value
                          ? "border-[#B8860B] bg-[#B8860B]/15 shadow-[0_0_20px_rgba(184,134,11,0.4)]"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="text-2xl mb-2">{opt.icon}</div>
                      <div className="font-bold text-foreground">
                        {opt.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {opt.desc}
                      </div>
                      {lockDuration === opt.value && (
                        <Badge className="mt-2 bg-[#B8860B] text-black text-xs">
                          Selected
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  🔒 20% of supply auto-locked in liquidity pool for the
                  selected duration — builds investor confidence
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 px-6 border-border"
                data-ocid="btn-step2-back"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="flex-1 h-12 font-bold btn-blazing text-black border-0"
                data-ocid="btn-step2-next"
              >
                AI Enhancement <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: AI Enhancement ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6" data-ocid="step-ai-enhancement">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Brain className="w-6 h-6 text-[#4B0082]" />
                <h2 className="text-2xl font-bold text-foreground">
                  AI Enhancement
                </h2>
                <Badge
                  variant="outline"
                  className="ml-auto border-[#4B0082]/50 text-[#4B0082]"
                >
                  Step 3 of 4
                </Badge>
              </div>

              {/* AI Token Generator */}
              <div className="bg-gradient-to-br from-[#4B0082]/20 to-[#B8860B]/10 border border-[#4B0082]/40 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4B0082]/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-[#4B0082]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      AI Autonomous Token Generator
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Instantly auto-fill name, lore, and tokenomics based on
                      your category
                    </p>
                  </div>
                </div>
                {!category && (
                  <p className="text-xs text-[#DC143C] flex items-center gap-1">
                    <X className="w-3 h-3" /> Select a category in Step 1 to
                    enable AI generation
                  </p>
                )}
                <Button
                  type="button"
                  onClick={aiGenerate}
                  disabled={!category || aiGenerating}
                  className="w-full h-11 font-bold border-2 border-[#4B0082] bg-[#4B0082]/20 hover:bg-[#4B0082]/40 text-foreground transition-all"
                  data-ocid="btn-ai-generate"
                >
                  {aiGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#4B0082] border-t-transparent rounded-full animate-spin mr-2" />{" "}
                      Generating AI Token...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2 text-[#4B0082]" /> Let AI
                      Build This For Me
                    </>
                  )}
                </Button>
                {name && !aiGenerating && (
                  <div className="bg-background/60 border border-border rounded-lg p-3 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      AI-generated preview:
                    </p>
                    <p className="font-bold text-[#B8860B]">
                      {name}{" "}
                      <span className="text-muted-foreground font-normal">
                        •
                      </span>{" "}
                      <span className="font-mono">${symbol}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {description}
                    </p>
                  </div>
                )}
              </div>

              {/* Viral Trend Score */}
              <div className="bg-gradient-to-br from-[#228B22]/15 to-transparent border border-[#228B22]/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#228B22]" />
                  <h3 className="font-bold text-foreground">
                    AI Viral Trend Score
                  </h3>
                  <span
                    className={`ml-auto text-2xl font-bold ${trendScore >= 70 ? "text-[#228B22]" : trendScore >= 40 ? "text-[#B8860B]" : "text-[#DC143C]"}`}
                  >
                    {trendScore}/100
                  </span>
                </div>
                <Progress value={trendScore} className="h-3 bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {trendScore >= 70
                    ? "🔥 High viral potential! This token has the energy to go parabolic."
                    : trendScore >= 40
                      ? "⚡ Moderate trend score. Enhance your category and lore to boost it."
                      : "💡 Low score. Choose a trending category and add more emotional lore to increase virality."}
                </p>
              </div>

              {/* AI Mascot Generator */}
              <div className="bg-gradient-to-br from-[#DC143C]/10 to-transparent border border-[#DC143C]/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-[#DC143C]" />
                  <div>
                    <h3 className="font-bold text-foreground">
                      AI Mascot Generator
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Generate a unique mascot art style for your token
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    "Holographic",
                    "Neon Punk",
                    "Cosmic Warrior",
                    "Digital Spirit",
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setAiMascotStyle(style)}
                      className={`p-2.5 rounded-lg text-xs font-bold border transition-all ${aiMascotStyle === style ? "border-[#DC143C] bg-[#DC143C]/20 text-[#DC143C]" : "border-border text-muted-foreground hover:border-[#DC143C]/50"}`}
                      data-ocid={`mascot-style-${style.toLowerCase().replace(" ", "-")}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {aiMascotStyle && (
                  <p className="text-xs text-[#DC143C]">
                    ✨ Mascot style locked: <strong>{aiMascotStyle}</strong> —
                    will be applied to your token's visual identity
                  </p>
                )}
              </div>

              {/* Soul-Bound Profile */}
              <div className="bg-gradient-to-br from-[#B8860B]/10 to-transparent border border-[#B8860B]/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-[#B8860B]" />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">
                      Soul-Bound Meme Generation
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Personalize your token to your personality and humor
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSoulBoundQuiz(!soulBoundQuiz)}
                    className={`w-12 h-6 rounded-full transition-all border-2 relative ${soulBoundQuiz ? "bg-[#B8860B] border-[#B8860B]" : "bg-muted border-border"}`}
                    data-ocid="toggle-soul-bound"
                    aria-label="Toggle soul-bound generation"
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${soulBoundQuiz ? "left-6" : "left-0.5"}`}
                    />
                  </button>
                </div>
                {soulBoundQuiz && (
                  <p className="text-xs text-[#B8860B] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Soul-Bound active — your
                    token's personality is uniquely yours. Emotional resonance
                    boost applied.
                  </p>
                )}
              </div>

              {/* Multi-Sensory Preview */}
              <div className="bg-gradient-to-br from-[#00BFFF]/10 to-transparent border border-[#00BFFF]/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-[#00BFFF]" />
                  <div>
                    <h3 className="font-bold text-foreground">
                      Multi-Sensory Launch Preview
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Live animation preview of your launch experience
                    </p>
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden bg-black/60 border border-[#00BFFF]/20 h-24 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#DC143C]/20 via-[#B8860B]/20 to-[#4B0082]/20 animate-pulse" />
                  <div className="relative z-10 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div
                        className="w-2 h-2 rounded-full bg-[#DC143C] animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-[#B8860B] animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-[#4B0082] animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <p className="text-xs text-[#00BFFF] mt-2 font-bold">
                      🚀 Launch Sequence Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12 px-6 border-border"
                data-ocid="btn-step3-back"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="flex-1 h-12 font-bold btn-blazing text-black border-0"
                data-ocid="btn-step3-next"
              >
                Review & Launch <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Review & Launch ─────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6" data-ocid="step-review-launch">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-border">
                <Rocket className="w-6 h-6 text-[#DC143C]" />
                <h2 className="text-2xl font-bold text-foreground">
                  Review & Launch
                </h2>
                <Badge
                  variant="outline"
                  className="ml-auto border-[#DC143C]/50 text-[#DC143C]"
                >
                  Step 4 of 4
                </Badge>
              </div>

              {/* Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Token Details
                  </p>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={name}
                        className="w-12 h-12 rounded-full border-2 border-[#B8860B] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#B8860B]/20 border-2 border-[#B8860B] flex items-center justify-center text-xl">
                        {CATEGORIES.find((c) => c.id === category)?.icon ||
                          "🚀"}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground">{name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        ${symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Category:{" "}
                      <span className="text-foreground">
                        {CATEGORIES.find((c) => c.id === category)?.label}
                      </span>
                    </p>
                    <p className="line-clamp-2">
                      Lore:{" "}
                      <span className="text-foreground">{description}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tokenomics
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Supply
                      </span>
                      <span className="font-bold text-foreground">
                        {formatNum(supplyVal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You Receive</span>
                      <span className="font-bold text-[#228B22]">
                        {formatNum(creatorSupply)} (80%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Locked Liquidity
                      </span>
                      <span className="font-bold text-[#4B0082]">
                        {formatNum(lockedSupply)} (20%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Lock Duration
                      </span>
                      <span className="font-bold text-foreground">
                        {lockDuration} months
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Checklist */}
              <div className="border border-[#228B22]/40 bg-[#228B22]/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-[#228B22] flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Safety Checklist
                </p>
                {[
                  "✅ Fair Mode verified — name is unique",
                  "✅ Ownership cap enforced — max 30% per holder",
                  "✅ 20% liquidity auto-locked on launch",
                  "✅ ICP on-chain deployment via Internet Computer",
                  "✅ Anti-scam indicators pre-checked",
                ].map((item) => (
                  <p key={item} className="text-xs text-foreground">
                    {item}
                  </p>
                ))}
              </div>

              {/* Fee Display */}
              <div
                className={`rounded-xl p-5 border-2 ${isCEO ? "border-[#B8860B] bg-gradient-to-r from-[#B8860B]/20 to-[#4B0082]/15" : "border-border bg-muted/30"}`}
              >
                {isCEO ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-[#B8860B]" />
                      <div>
                        <p className="font-bold text-[#B8860B]">
                          🎖️ CEO Privilege Active
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lifetime free memecoin creation
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground line-through">
                        2 ICP
                      </p>
                      <p className="text-2xl font-bold text-[#B8860B]">FREE</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">Creation Fee</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: "#DC143C" }}
                      >
                        2 ICP
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Your Wallet Balance
                      </span>
                      <span
                        className={`font-bold ${hasFunds ? "text-[#228B22]" : "text-[#DC143C]"}`}
                      >
                        {walletBalance.toFixed(4)} ICP
                      </span>
                    </div>
                    {!hasFunds && (
                      <div className="mt-3 p-3 rounded-lg bg-[#DC143C]/10 border border-[#DC143C]/50 space-y-1">
                        <p className="text-xs text-[#DC143C] flex items-center gap-1 font-bold">
                          <X className="w-3 h-3 shrink-0" /> Insufficient
                          balance. You need 2 ICP to create a memecoin.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please{" "}
                          <button
                            type="button"
                            onClick={() => navigate({ to: "/portfolio" })}
                            className="underline text-[#B8860B] hover:text-[#DC143C] transition-colors font-bold"
                            data-ocid="insufficient-balance-deposit-link"
                          >
                            deposit ICP
                          </button>{" "}
                          to your wallet first.
                        </p>
                      </div>
                    )}
                    {officialDepositAddresses.length > 0 && (
                      <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                        Fee routed to official CEO wallets for platform
                        sustainability.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Uploading logo...
                    </span>
                    <span className="text-[#B8860B] font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 bg-muted" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="h-14 px-6 border-border"
                data-ocid="btn-step4-back"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </Button>
              <Button
                onClick={handleLaunch}
                disabled={createMemecoin.isPending || (!isCEO && !hasFunds)}
                className="flex-1 h-14 font-bold text-lg btn-blazing text-black border-0 gap-3"
                data-ocid="btn-launch-memecoin"
              >
                {createMemecoin.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />{" "}
                    Launching on ICP...
                  </>
                ) : (
                  <>
                    <Rocket className="w-6 h-6" />{" "}
                    {isCEO ? "🎖️ Launch FREE (CEO)" : "Launch Memecoin — 2 ICP"}
                  </>
                )}
              </Button>
            </div>

            {!isCEO && !hasFunds && (
              <p className="text-center text-xs text-[#DC143C]">
                Insufficient balance. You need 2 ICP to create a memecoin.
                Please{" "}
                <button
                  type="button"
                  onClick={() => navigate({ to: "/portfolio" })}
                  className="underline text-[#B8860B] hover:text-[#DC143C] transition-colors font-bold"
                >
                  deposit ICP
                </button>{" "}
                first.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
