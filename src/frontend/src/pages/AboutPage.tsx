import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Twitter,
  Users,
  Zap,
} from "lucide-react";
import { SiTelegram } from "react-icons/si";

const PLATFORM_STATS = [
  {
    label: "Memecoins Created",
    value: "12,847",
    icon: Rocket,
    color: "text-amber-400",
  },
  {
    label: "Total Volume",
    value: "$8.3M ICP",
    icon: BarChart3,
    color: "text-green-400",
  },
  {
    label: "Active Traders",
    value: "48,291",
    icon: Users,
    color: "text-blue-400",
  },
  {
    label: "AI Features Live",
    value: "17",
    icon: Brain,
    color: "text-purple-400",
  },
  {
    label: "Safety Indicators",
    value: "12",
    icon: Shield,
    color: "text-cyan-400",
  },
  {
    label: "Liquidity Pools",
    value: "3,401",
    icon: Zap,
    color: "text-pink-400",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Everything",
    desc: "17 live autonomous AI modules handle token creation, trend prediction, marketing, and trading analysis.",
  },
  {
    icon: Shield,
    title: "12 Anti-Scam Indicators",
    desc: "Real-time AI-driven safety scores, honeypot simulation, liquidity health, and holder diversity radar.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast DEX",
    desc: "Advanced trading with order book, limit/market orders, live charts (RSI, MACD, Bollinger), sub-second execution.",
  },
  {
    icon: Lock,
    title: "Canonical ICP Integration",
    desc: "Real on-chain deposits and withdrawals using SHA-224 + CRC32 AccountIdentifier — exchange-grade compatibility.",
  },
  {
    icon: Cpu,
    title: "Decentralized & Censorship-Free",
    desc: "Fully deployed on Internet Computer Protocol — no servers, no downtime, globally accessible to everyone.",
  },
  {
    icon: Star,
    title: "4D Holographic Experience",
    desc: "Immersive, quantum-inspired UI with holographic cards, FOMO weather system, and meme war arena.",
  },
];

const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "complete",
    items: [
      "ICP Ledger Integration",
      "AI Token Generator",
      "Advanced DEX",
      "Safety Indicators",
    ],
  },
  {
    phase: "Phase 2",
    title: "AI Expansion",
    status: "active",
    items: [
      "Living NFT Engine",
      "Voice-to-Memecoin",
      "Meme War Arena",
      "Auto-Marketing Bot",
    ],
  },
  {
    phase: "Phase 3",
    title: "Ecosystem",
    status: "upcoming",
    items: [
      "Cross-Chain Bridges",
      "DAO Governance",
      "AI Staking Vaults",
      "DappRadar Listing",
    ],
  },
  {
    phase: "Phase 4",
    title: "Metaverse",
    status: "upcoming",
    items: [
      "3D Meme Worlds",
      "VR Trading",
      "Soul-Bound NFTs",
      "Quantum Finance Layer",
    ],
  },
];

const SAFETY_INDICATORS = [
  {
    name: "AI Behavioral Risk Score",
    color: "text-green-400",
    score: "92/100",
  },
  {
    name: "Meme Authenticity Meter",
    color: "text-blue-400",
    score: "Verified ✓",
  },
  { name: "Tokenomics Safety", color: "text-green-400", score: "Safe ✓" },
  { name: "Developer Transparency", color: "text-amber-400", score: "78/100" },
  {
    name: "Contract Similarity Check",
    color: "text-green-400",
    score: "Unique ✓",
  },
  { name: "Social Sentiment Score", color: "text-blue-400", score: "87/100" },
  { name: "Investor Trust Gauge", color: "text-green-400", score: "94/100" },
  { name: "Honeypot Simulation", color: "text-green-400", score: "Safe ✓" },
  {
    name: "Holder Diversity Radar",
    color: "text-cyan-400",
    score: "Healthy ✓",
  },
  { name: "Liquidity Depth Health", color: "text-green-400", score: "89%" },
  { name: "Time-Lock Indicator", color: "text-amber-400", score: "6 months" },
  { name: "Meme Origin Proof", color: "text-green-400", score: "Original ✓" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-purple-950/30 to-black border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,oklch(0.65_0.15_70/0.12),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm font-bold tracking-widest">
            ✦ ABOUT ICPWORLDMEMEPAD ✦
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-pink-400 leading-tight">
            The World's First
            <br />
            AI-Powered Quantum Memepad
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
            Built on the Internet Computer Protocol — where AI, blockchain, and
            human creativity converge into the most advanced memecoin launchpad
            ever conceived.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="https://x.com/icpmemeworld"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="bg-black hover:bg-black/80 text-white border border-white/20 font-bold gap-2"
                data-ocid="twitter-link"
              >
                <Twitter className="h-4 w-4" />
                @icpmemeworld
              </Button>
            </a>
            <a
              href="https://t.me/icpworldmemepad"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                data-ocid="telegram-link"
              >
                <SiTelegram className="h-4 w-4" />
                Join Telegram
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORM_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="p-4 border-border bg-card/80 text-center space-y-2 hover:border-primary/30 transition-colors"
                >
                  <Icon className={`h-6 w-6 mx-auto ${stat.color}`} />
                  <p className={`text-xl font-bold font-display ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {stat.label}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Mission */}
        <section>
          <Card className="p-8 border-primary/30 bg-gradient-to-br from-card via-purple-950/10 to-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-4 max-w-3xl">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Our Mission
              </Badge>
              <h2 className="text-3xl font-display font-bold text-foreground">
                Democratizing Memecoin Creation for the World
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                ICPWorldMemepad was born from a vision: what if anyone — with no
                coding experience, no capital barriers, and no limits — could
                create, launch, and trade a memecoin? We built the answer on the
                most advanced blockchain infrastructure on Earth: the Internet
                Computer Protocol.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every feature is live, operational, and designed to give the
                community tools previously reserved for teams of developers and
                VCs. Our AI makes genius-level decisions in milliseconds. Our
                safety suite protects users from scams before they happen. Our
                DEX trades faster than centralized exchanges.
              </p>
            </div>
          </Card>
        </section>

        {/* Platform Features */}
        <section>
          <div className="text-center mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Never-Before-Seen Features
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="p-5 border-border bg-card/80 hover:border-primary/40 transition-colors space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{f.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CEO */}
        <section>
          <div className="text-center mb-8">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-3">
              Founding Team
            </Badge>
            <h2 className="text-3xl font-display font-bold text-foreground">
              Leadership
            </h2>
          </div>
          <div className="max-w-md mx-auto">
            <Card className="p-8 border-amber-400/30 bg-gradient-to-br from-card via-amber-950/10 to-card text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-primary to-pink-500 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-400/20">
                👑
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  Akmal Bhutta
                </p>
                <p className="text-primary font-medium">CEO & Founder</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Visionary",
                  "ICP Pioneer",
                  "AI Architect",
                  "Crypto Builder",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pioneering the fusion of artificial intelligence and blockchain
                technology to create the world's most advanced memecoin
                ecosystem — designed for the next generation of crypto users.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <a
                  href="https://x.com/icpmemeworld"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-ocid="ceo-twitter"
                  >
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </Button>
                </a>
                <a
                  href="https://t.me/icpworldmemepad"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    data-ocid="ceo-telegram"
                  >
                    <SiTelegram className="h-3.5 w-3.5" /> Telegram
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* Safety */}
        <section>
          <Card className="p-8 border-green-500/20 bg-card/80">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Shield className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-display font-bold text-foreground">
                Safety First — Always
              </h2>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                12 Live Indicators
              </Badge>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              ICPWorldMemepad is the only memecoin platform with 12 AI-powered
              live safety indicators running on every single token. We don't
              just launch coins — we protect investors.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SAFETY_INDICATORS.map((s) => (
                <div key={s.name} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground font-medium leading-tight">
                      {s.name}
                    </p>
                    <p className={`${s.color} font-bold`}>{s.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Roadmap */}
        <section>
          <div className="text-center mb-8">
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
              Platform Roadmap
            </Badge>
            <h2 className="text-3xl font-display font-bold text-foreground">
              The Path to Domination
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROADMAP.map((r) => (
              <Card
                key={r.phase}
                className={`p-5 border-border bg-card/80 space-y-3 ${r.status === "active" ? "border-primary/40" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">
                    {r.phase}
                  </span>
                  <Badge
                    className={
                      r.status === "complete"
                        ? "bg-green-500/20 text-green-400 border-0 text-xs"
                        : r.status === "active"
                          ? "bg-amber-500/20 text-amber-400 border-0 text-xs animate-pulse"
                          : "bg-muted text-muted-foreground border-0 text-xs"
                    }
                  >
                    {r.status === "complete"
                      ? "✓ Done"
                      : r.status === "active"
                        ? "● Live"
                        : "○ Soon"}
                  </Badge>
                </div>
                <h3 className="font-bold text-foreground">{r.title}</h3>
                <ul className="space-y-1">
                  {r.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className={
                          r.status === "complete"
                            ? "text-green-400"
                            : r.status === "active"
                              ? "text-amber-400"
                              : "text-muted-foreground"
                        }
                      >
                        ▸
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <Card className="p-10 border-primary/30 bg-gradient-to-br from-black via-purple-950/20 to-black text-center space-y-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,oklch(0.65_0.15_70/0.08),transparent_70%)] pointer-events-none" />
            <div className="relative space-y-4">
              <div className="text-5xl">🚀</div>
              <h2 className="text-3xl font-display font-bold text-foreground">
                Ready to Create the Next Viral Memecoin?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join 48,291 creators and traders on the world's most advanced
                AI-powered memepad. Your coin could be the next phenomenon.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a href="/create" data-ocid="about-create-cta">
                  <Button className="bg-primary text-primary-foreground font-bold px-8 h-12 text-base gap-2">
                    <Sparkles className="h-5 w-5" /> Launch Your Memecoin
                  </Button>
                </a>
                <a
                  href="https://x.com/icpmemeworld"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="about-twitter-cta"
                >
                  <Button
                    variant="outline"
                    className="px-8 h-12 gap-2 text-base"
                  >
                    <Twitter className="h-5 w-5" /> Follow on X
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
