import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Cpu, Layers, Palette, Sparkles, Type } from "lucide-react";

const COLOR_TOKENS = [
  {
    name: "Background",
    value: "oklch(0.08 0 0)",
    class: "bg-background",
    label: "Obsidian Black",
  },
  {
    name: "Card",
    value: "oklch(0.12 0 0)",
    class: "bg-card",
    label: "Deep Space",
  },
  {
    name: "Primary (Gold)",
    value: "oklch(0.65 0.15 70)",
    class: "bg-primary",
    label: "Quantum Gold",
  },
  {
    name: "Secondary (Red)",
    value: "oklch(0.55 0.25 25)",
    class: "bg-secondary",
    label: "Crimson Pulse",
  },
  {
    name: "Accent (Purple)",
    value: "oklch(0.45 0.18 310)",
    class: "bg-accent",
    label: "Void Purple",
  },
  {
    name: "Muted",
    value: "oklch(0.16 0 0)",
    class: "bg-muted",
    label: "Shadow Dark",
  },
];

const TYPOGRAPHY = [
  {
    name: "Display Font",
    value: "Space Grotesk",
    usage: "Headlines, section titles, feature names",
    weight: "700-900",
  },
  {
    name: "Body Font",
    value: "DM Sans",
    usage: "Paragraphs, descriptions, UI labels",
    weight: "400-600",
  },
  {
    name: "Mono Font",
    value: "Geist Mono",
    usage: "Addresses, amounts, code, symbols",
    weight: "400-700",
  },
];

const AI_ARCHITECTURE = [
  {
    module: "Token Generator",
    tech: "Simulated AI pipeline",
    status: "Live",
    desc: "Randomized AI-pattern outputs with variety engine",
  },
  {
    module: "Trend Predictor",
    tech: "Real-time signal simulation",
    status: "Live",
    desc: "Animated live-updating viral score system",
  },
  {
    module: "Hype Weather",
    tech: "30s cycle state machine",
    status: "Live",
    desc: "Weather transitions with animated backgrounds",
  },
  {
    module: "Meme War Arena",
    tech: "Vote accumulation engine",
    status: "Live",
    desc: "Real-time vote counting with progress bars",
  },
  {
    module: "Soul-Bound Generation",
    tech: "Decision tree mapping",
    status: "Live",
    desc: "Personality quiz → coin archetype mapping",
  },
  {
    module: "Living NFTs",
    tech: "Evolution stage system",
    status: "Live",
    desc: "Level-based progression and trait display",
  },
  {
    module: "Voice Interface",
    tech: "Browser MediaStream API",
    status: "Live",
    desc: "Mic access with waveform visualization",
  },
];

const LAYOUT_ZONES = [
  {
    zone: "Page Background",
    token: "bg-background",
    color: "#121212",
    desc: "Obsidian base layer",
  },
  {
    zone: "Cards & Panels",
    token: "bg-card",
    color: "#1a1a1a",
    desc: "Elevated surfaces",
  },
  {
    zone: "Subtle Areas",
    token: "bg-muted/40",
    color: "#222",
    desc: "Input fields, dividers",
  },
  {
    zone: "Interactive",
    token: "bg-primary",
    color: "#C9A227",
    desc: "Buttons, highlights",
  },
  {
    zone: "Danger / Red",
    token: "bg-secondary",
    color: "#8B2020",
    desc: "Warnings, battles",
  },
  {
    zone: "Mystical",
    token: "bg-accent",
    color: "#5B2D8E",
    desc: "Holographic effects",
  },
];

const DESIGN_PRINCIPLES = [
  {
    title: "Quantum Obsidian Aesthetic",
    desc: "Deep black backgrounds with gold, crimson, and purple accents create a premium crypto-quantum visual language.",
  },
  {
    title: "FOMO-First UX",
    desc: "Every interaction is designed to trigger excitement, urgency, and desire. Live counters, animated scores, and real-time data dominate.",
  },
  {
    title: "AI-Native Interactions",
    desc: "Every feature appears to use live AI — simulated real-time data, animated outputs, and confidence-inducing loading states.",
  },
  {
    title: "Accessibility + Immersion",
    desc: "Full keyboard navigation, reduced-motion support, and high-contrast tokens alongside cinematic visual effects.",
  },
];

function SectionTitle({
  icon: Icon,
  title,
}: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-xl font-display font-bold text-foreground">
        {title}
      </h2>
    </div>
  );
}

export default function DesignBlueprintPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-purple-950/20 to-black border-b border-border py-12 px-6 text-center">
        <Badge className="bg-primary/20 text-primary border-primary/30 mb-3 px-4 py-1 text-sm font-bold">
          DESIGN SYSTEM
        </Badge>
        <h1 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-primary to-pink-400">
          ICPWorldMemepad Design Blueprint
        </h1>
        <p className="text-muted-foreground mt-3">
          Quantum-inspired design system — tokens, typography, architecture, and
          AI patterns
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">
        {/* Color palette */}
        <section>
          <SectionTitle icon={Palette} title="Color Tokens" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {COLOR_TOKENS.map((c) => (
              <Card
                key={c.name}
                className="overflow-hidden border-border bg-card/80"
              >
                <div className={`h-20 ${c.class} flex items-end p-2`}>
                  <span className="text-xs font-mono text-foreground/60">
                    {c.value}
                  </span>
                </div>
                <div className="p-3 space-y-0.5">
                  <p className="font-bold text-sm text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionTitle icon={Type} title="Typography System" />
          <div className="space-y-4">
            {TYPOGRAPHY.map((t) => (
              <Card
                key={t.name}
                className="p-5 border-border bg-card/80 flex items-center gap-6 flex-wrap"
              >
                <div className="min-w-40">
                  <p className="text-sm text-muted-foreground">{t.name}</p>
                  <p className="font-bold text-primary text-lg">{t.value}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Usage: {t.usage}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Weight: {t.weight}
                  </p>
                </div>
                <p
                  className="text-2xl font-bold shrink-0"
                  style={{ fontFamily: t.value }}
                >
                  Aa Bb 123
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Layout zones */}
        <section>
          <SectionTitle icon={Layers} title="Layout Zone System" />
          <div className="grid md:grid-cols-2 gap-4">
            {LAYOUT_ZONES.map((z) => (
              <Card
                key={z.zone}
                className="p-4 border-border bg-card/80 flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-lg border border-border shrink-0"
                  style={{ backgroundColor: z.color }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {z.zone}
                  </p>
                  <p className="font-mono text-xs text-primary">{z.token}</p>
                  <p className="text-xs text-muted-foreground">{z.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Architecture */}
        <section>
          <SectionTitle icon={Cpu} title="AI Module Architecture" />
          <div className="overflow-x-auto rounded-xl border border-border bg-card/80">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Module
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Technology
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {AI_ARCHITECTURE.map((a) => (
                  <tr
                    key={a.module}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {a.module}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-primary">
                      {a.tech}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {a.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Design principles */}
        <section>
          <SectionTitle icon={Sparkles} title="Design Principles" />
          <div className="grid md:grid-cols-2 gap-4">
            {DESIGN_PRINCIPLES.map((p) => (
              <Card
                key={p.title}
                className="p-5 border-border bg-card/80 space-y-2"
              >
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
