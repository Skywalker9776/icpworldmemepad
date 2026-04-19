import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Coins, Lock } from "lucide-react";
import type { Memecoin } from "../backend";

interface MemecoinCardProps {
  coin: Memecoin;
  badge?: "hot" | "trending" | "new" | "progressing";
}

const BADGE_CONFIG = {
  hot: { label: "🔥 Hot", variant: "destructive" as const },
  trending: { label: "📈 Trending", variant: "default" as const },
  new: { label: "✨ New", variant: "secondary" as const },
  progressing: { label: "🚀 Progressing", variant: "outline" as const },
};

export default function MemecoinCard({ coin, badge }: MemecoinCardProps) {
  const isLiquidityLocked = coin.liquidityLock.isLocked;
  const lockDurationYears = Number(coin.liquidityLock.duration);
  const unlockDate = new Date(
    Number(coin.liquidityLock.unlockDate) / 1_000_000,
  );
  const badgeConfig = badge ? BADGE_CONFIG[badge] : null;

  return (
    <Card
      className="border-2 border-primary/20 hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-card/50"
      data-ocid="memecoin-card-simple"
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={coin.logo.getDirectURL()}
            alt={coin.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-xl truncate">{coin.name}</CardTitle>
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

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {coin.description}
        </p>

        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Coins className="h-3 w-3" />
              {Number(coin.totalSupply).toLocaleString()}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-green-500/40 text-green-400"
            >
              <Clock className="h-3 w-3" /> Active
            </Badge>
          </div>

          {isLiquidityLocked && (
            <Alert className="border-primary/30 bg-primary/5">
              <Lock className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs space-y-1">
                <p className="font-semibold">Liquidity Locked</p>
                <p>
                  20% locked for {lockDurationYears} year
                  {lockDurationYears !== 1 ? "s" : ""}
                </p>
                <p className="text-muted-foreground">
                  Unlocks: {unlockDate.toLocaleDateString()}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Max Ownership</span>
              <span className="font-semibold">30% limit</span>
            </div>
            <Progress value={30} className="h-2" />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              No single holder can own more than 30%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
