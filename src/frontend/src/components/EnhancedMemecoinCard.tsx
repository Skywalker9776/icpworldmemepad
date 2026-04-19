import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  Clock,
  Coins,
  Copy,
  Droplets,
  ExternalLink,
  Info,
  Lock,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Memecoin } from "../backend";

interface EnhancedMemecoinCardProps {
  coin: Memecoin;
  badge?: "hot" | "trending" | "new" | "progressing";
}

const BADGE_CONFIG = {
  hot: { label: "🔥 Hot", variant: "destructive" as const },
  trending: { label: "📈 Trending", variant: "default" as const },
  new: { label: "✨ New", variant: "secondary" as const },
  progressing: { label: "🚀 Progressing", variant: "outline" as const },
};

// Simulated safety score (0-100) based on token properties
function getSafetyScore(coin: Memecoin) {
  let score = 70;
  if (coin.liquidityLock.isLocked) score += 20;
  if (Number(coin.liquidityLock.duration) >= 1) score += 10;
  return Math.min(100, score);
}

export default function EnhancedMemecoinCard({
  coin,
  badge,
}: EnhancedMemecoinCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const isLiquidityLocked = coin.liquidityLock.isLocked;
  const lockDurationYears = Number(coin.liquidityLock.duration);
  const unlockDate = new Date(
    Number(coin.liquidityLock.unlockDate) / 1_000_000,
  );
  const contractAddress = `${coin.symbol.toLowerCase()}_${coin.creator.toString().slice(0, 8)}`;
  const safetyScore = getSafetyScore(coin);
  const safetyColor =
    safetyScore >= 80
      ? "text-green-400"
      : safetyScore >= 60
        ? "text-yellow-400"
        : "text-red-400";

  const copyContractAddress = async () => {
    await navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const badgeConfig = badge ? BADGE_CONFIG[badge] : null;

  return (
    <>
      <Card
        className="group border-2 border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/70"
        data-ocid="memecoin-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <img
              src={coin.logo.getDirectURL()}
              alt={coin.name}
              className="h-14 w-14 rounded-full object-cover border-2 border-primary/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg truncate">{coin.name}</CardTitle>
                {badgeConfig && (
                  <Badge
                    variant={badgeConfig.variant}
                    className="text-xs shrink-0"
                  >
                    {badgeConfig.label}
                  </Badge>
                )}
              </div>
              <CardDescription className="font-mono text-sm font-semibold">
                ${coin.symbol}
              </CardDescription>
              {coin.category && (
                <Badge
                  variant="outline"
                  className="text-xs mt-1 border-accent/40 text-accent"
                >
                  {coin.category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {coin.description}
          </p>

          {/* Contract Address */}
          <div
            className="p-2.5 rounded-lg bg-muted/20 border border-border/50 space-y-1"
            data-ocid="contract-address-block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Contract
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyContractAddress}
                className="h-5 px-1.5 text-xs text-primary hover:text-primary/80"
                data-ocid="copy-contract-btn"
              >
                {copiedContract ? "Copied!" : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <p className="font-mono text-xs text-foreground/80 truncate">
              {contractAddress}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Coins className="h-3 w-3" />
              <span>{Number(coin.totalSupply).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className={`font-semibold ${safetyColor}`}>
                Safety {safetyScore}%
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{isLiquidityLocked ? "Locked" : "Unlocked"}</span>
            </div>
          </div>

          {isLiquidityLocked && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">
                20% liquidity locked {lockDurationYears}yr — unlocks{" "}
                {unlockDate.toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => setShowDetails(true)}
              size="sm"
              className="flex-1 gap-1.5 font-bold"
              data-ocid="trade-btn"
            >
              <TrendingUp className="h-4 w-4" /> Trade
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
              data-ocid="pool-btn"
            >
              <Droplets className="h-4 w-4" /> Pool
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-secondary/40 text-secondary hover:bg-secondary/10"
              data-ocid="swap-btn"
            >
              <ArrowDownUp className="h-4 w-4" /> Swap
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-card border-2 border-primary/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <img
                src={coin.logo.getDirectURL()}
                alt={coin.name}
                className="h-10 w-10 rounded-full border-2 border-primary/40"
              />
              {coin.name}{" "}
              <span className="text-muted-foreground font-mono">
                ${coin.symbol}
              </span>
            </DialogTitle>
            <DialogDescription>
              Detailed trading information and token stats
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Supply
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {Number(coin.totalSupply).toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">
                  Safety Score
                </p>
                <p className={`text-2xl font-bold ${safetyColor}`}>
                  {safetyScore}/100
                </p>
              </div>
            </div>

            {/* Contract with copy */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Contract Address
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-foreground flex-1 break-all">
                  {contractAddress}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={copyContractAddress}
                >
                  <Copy className="h-3.5 w-3.5 text-primary" />
                </Button>
              </div>
            </div>

            {/* Safety Indicators */}
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Safety Indicators
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Liquidity Locked",
                    value: isLiquidityLocked,
                    detail: isLiquidityLocked
                      ? `${lockDurationYears}yr`
                      : "Unlocked",
                  },
                  {
                    label: "Ownership Limit",
                    value: true,
                    detail: "30% max per holder",
                  },
                  {
                    label: "Fair Launch",
                    value: true,
                    detail: "No duplicate names",
                  },
                  { label: "On-Chain", value: true, detail: "ICP Blockchain" },
                ].map(({ label, value, detail }) => (
                  <div
                    key={label}
                    className={`p-3 rounded-lg border ${value ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-xs font-semibold ${value ? "text-green-400" : "text-red-400"}`}
                      >
                        {value ? "✓" : "✗"} {label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership warning */}
            <Alert className="border-primary/20 bg-primary/5">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-1">Trading Information</p>
                <ul className="text-muted-foreground space-y-0.5 text-xs">
                  <li>• ICP/{coin.symbol} liquidity pool available</li>
                  <li>• Direct swap with adjustable slippage</li>
                  <li>• Max 30% ownership per holder (safety rule)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
