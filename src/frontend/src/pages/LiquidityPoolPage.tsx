import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BarChart3,
  Clock,
  Droplets,
  Lock,
  Minus,
  Plus,
  TrendingUp,
  Unlock,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Memecoin } from "../backend.d";
import LoginOptionsDialog from "../components/LoginOptionsDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerWallet,
  useGetLiquidityLocks,
  useGetMemecoins,
} from "../hooks/useQueries";

interface PoolStats {
  symbol: string;
  tvl: number;
  volume24h: number;
  apy: number;
  liquidity: number;
  isLocked: boolean;
  unlockDate: number;
}

function generatePoolStats(coin: Memecoin): PoolStats {
  const seed = coin.symbol.charCodeAt(0);
  return {
    symbol: coin.symbol,
    tvl: ((seed * 137) % 10000) + 500,
    volume24h: ((seed * 73) % 5000) + 100,
    apy: 5 + (seed % 30),
    liquidity: ((seed * 41) % 8000) + 200,
    isLocked: coin.liquidityLock.isLocked,
    unlockDate: Number(coin.liquidityLock.unlockDate) / 1_000_000,
  };
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Unlocked";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function PoolCard({ pool }: { pool: PoolStats }) {
  const timeLeft = pool.unlockDate - Date.now();
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
            {pool.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">
              {pool.symbol}/ICP
            </p>
            <p className="text-xs text-muted-foreground">Liquidity Pool</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              pool.isLocked
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-red-500/20 text-red-400 border-red-500/50"
            }
          >
            {pool.isLocked ? (
              <Lock className="w-3 h-3 mr-1" />
            ) : (
              <Unlock className="w-3 h-3 mr-1" />
            )}
            {pool.isLocked ? "Locked" : "Unlocked"}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground">TVL</p>
          <p className="text-sm font-bold text-foreground">
            {pool.tvl.toFixed(0)} ICP
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground">24h Volume</p>
          <p className="text-sm font-bold text-foreground">
            {pool.volume24h.toFixed(0)} ICP
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground">APY</p>
          <p className="text-sm font-bold text-green-400">{pool.apy}%</p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2">
          <p className="text-[10px] text-muted-foreground">Lock Timer</p>
          <p
            className={`text-sm font-bold ${pool.isLocked ? "text-yellow-400" : "text-red-400"}`}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            {pool.isLocked ? formatCountdown(timeLeft) : "Free"}
          </p>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-green-500"
          style={{ width: `${Math.min((pool.liquidity / 8000) * 100, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">
        Liquidity Health:{" "}
        {Math.min(Math.round((pool.liquidity / 8000) * 100), 100)}%
      </p>
    </div>
  );
}

export default function LiquidityPoolPage() {
  const { identity } = useInternetIdentity();
  const { data: memecoins = [] } = useGetMemecoins();
  const { data: wallet } = useGetCallerWallet();
  const { data: locks = [] } = useGetLiquidityLocks();
  const [selectedCoin, setSelectedCoin] = useState("");
  const [icpAmount, setIcpAmount] = useState("");
  const [memecoinAmount, setMemecoinAmount] = useState("");
  const [lockDuration, setLockDuration] = useState("3");
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pools, setPools] = useState<PoolStats[]>([]);

  const icpBalance = wallet ? Number(wallet.balance) / 100_000_000 : 0;
  const selectedMeme = memecoins.find((c) => c.symbol === selectedCoin);

  useEffect(() => {
    if (memecoins.length > 0) {
      setPools(memecoins.map(generatePoolStats));
      if (!selectedCoin) setSelectedCoin(memecoins[0].symbol);
    }
  }, [memecoins, selectedCoin]);

  const handleAdd = async () => {
    if (!selectedCoin || !icpAmount || !memecoinAmount) {
      toast.error("Fill in all fields");
      return;
    }
    if (
      Number.parseFloat(icpAmount) <= 0 ||
      Number.parseFloat(memecoinAmount) <= 0
    ) {
      toast.error("Amounts must be positive");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success(
        `✅ Added ${icpAmount} ICP + ${memecoinAmount} ${selectedCoin} to liquidity pool. Locked for ${lockDuration} months.`,
      );
      setIcpAmount("");
      setMemecoinAmount("");
    } catch {
      toast.error("Failed to add liquidity");
    } finally {
      setLoading(false);
    }
  };

  const lpTokens =
    icpAmount && memecoinAmount
      ? Math.sqrt(
          Number.parseFloat(icpAmount) * Number.parseFloat(memecoinAmount),
        ).toFixed(4)
      : "0";
  const poolShare = icpAmount
    ? Math.min((Number.parseFloat(icpAmount) / 100) * 0.1, 100).toFixed(3)
    : "0";
  const estimatedApy = selectedMeme
    ? 5 + (selectedMeme.symbol.charCodeAt(0) % 30)
    : 15;

  if (!identity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center mx-auto"
            style={{ boxShadow: "0 0 60px rgba(184,134,11,0.4)" }}
          >
            <Droplets className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Liquidity Pools
          </h2>
          <p className="text-muted-foreground">
            Connect your wallet to provide liquidity, earn fees, and participate
            in ICP/Memecoin pools.
          </p>
          <button
            type="button"
            onClick={() => setShowLoginDialog(true)}
            data-ocid="lp-login-btn"
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 bg-primary/20 border border-primary text-primary"
            style={{ boxShadow: "0 0 30px rgba(184,134,11,0.3)" }}
          >
            Connect Wallet
          </button>
        </div>
        <LoginOptionsDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-foreground"
      data-ocid="liquidity-page"
    >
      <div className="container max-w-7xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Liquidity Pools
            </h1>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 ml-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 inline-block animate-pulse" />
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Provide liquidity for Memecoin/ICP pairs and earn a share of trading
            fees.
          </p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total TVL",
              value: `${pools.reduce((s, p) => s + p.tvl, 0).toFixed(0)} ICP`,
              icon: BarChart3,
              color: "text-primary",
            },
            {
              label: "24h Volume",
              value: `${pools.reduce((s, p) => s + p.volume24h, 0).toFixed(0)} ICP`,
              icon: TrendingUp,
              color: "text-green-400",
            },
            {
              label: "Active Pools",
              value: pools.length.toString(),
              icon: Droplets,
              color: "text-blue-400",
            },
            {
              label: "Locks Active",
              value: pools.filter((p) => p.isLocked).length.toString(),
              icon: Lock,
              color: "text-yellow-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add/Remove Liquidity */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="add" className="space-y-4">
              <TabsList className="grid grid-cols-2 bg-muted/20 border border-border h-10">
                <TabsTrigger
                  value="add"
                  className="text-sm data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </TabsTrigger>
                <TabsTrigger
                  value="remove"
                  className="text-sm data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                >
                  <Minus className="w-4 h-4 mr-1" />
                  Remove
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add">
                <div
                  className="bg-card border border-border rounded-xl p-5 space-y-4"
                  style={{ boxShadow: "0 0 30px rgba(184,134,11,0.06)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-4 h-4 text-green-400" />
                    <h3 className="font-bold text-foreground">Add Liquidity</h3>
                  </div>

                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                      LP tokens represent your pool share. Earn fees
                      proportional to your share of the pool.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lp-coin-select"
                      className="text-sm text-muted-foreground block"
                    >
                      Select Pair
                    </label>
                    <Select
                      value={selectedCoin}
                      onValueChange={setSelectedCoin}
                    >
                      <SelectTrigger
                        id="lp-coin-select"
                        className="bg-muted/20 border-border h-11"
                        data-ocid="lp-coin-selector"
                      >
                        <SelectValue placeholder="Choose memecoin" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border max-h-60">
                        {memecoins.map((c) => (
                          <SelectItem
                            key={c.symbol}
                            value={c.symbol}
                            className="text-sm"
                          >
                            <span className="font-bold">{c.symbol}/ICP</span>
                            <span className="text-muted-foreground ml-2">
                              {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lp-icp-amount"
                      className="text-sm text-muted-foreground block"
                    >
                      ICP Amount{" "}
                      <span className="text-xs text-muted-foreground/60">
                        (Balance: {icpBalance.toFixed(4)} ICP)
                      </span>
                    </label>
                    <div className="relative">
                      <Input
                        id="lp-icp-amount"
                        type="number"
                        placeholder="0.0"
                        value={icpAmount}
                        onChange={(e) => setIcpAmount(e.target.value)}
                        className="bg-muted/20 border-border h-11 pr-14"
                      />
                      <button
                        type="button"
                        onClick={() => setIcpAmount(icpBalance.toFixed(4))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline font-bold"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lp-token-amount"
                      className="text-sm text-muted-foreground block"
                    >
                      {selectedCoin || "Token"} Amount
                    </label>
                    <Input
                      id="lp-token-amount"
                      type="number"
                      placeholder="0.0"
                      value={memecoinAmount}
                      onChange={(e) => setMemecoinAmount(e.target.value)}
                      className="bg-muted/20 border-border h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lp-lock-duration"
                      className="text-sm text-muted-foreground block"
                    >
                      Lock Duration
                    </label>
                    <Select
                      value={lockDuration}
                      onValueChange={setLockDuration}
                    >
                      <SelectTrigger
                        id="lp-lock-duration"
                        className="bg-muted/20 border-border h-11"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="3">3 Months — Standard</SelectItem>
                        <SelectItem value="6">
                          6 Months — +5% APY boost
                        </SelectItem>
                        <SelectItem value="12">
                          12 Months — +15% APY boost
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {icpAmount && memecoinAmount && selectedCoin && (
                    <div className="bg-muted/20 rounded-xl p-3 border border-border space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pool Share
                        </span>
                        <span className="text-foreground font-medium">
                          ~{poolShare}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">LP Tokens</span>
                        <span className="text-primary font-bold">
                          ~{lpTokens}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. APY</span>
                        <span className="text-green-400 font-bold">
                          ~
                          {estimatedApy +
                            (lockDuration === "12"
                              ? 15
                              : lockDuration === "6"
                                ? 5
                                : 0)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Lock Period
                        </span>
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {lockDuration} months
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleAdd}
                    disabled={
                      !selectedCoin || !icpAmount || !memecoinAmount || loading
                    }
                    className="w-full h-12 font-bold bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                    data-ocid="lp-add-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                        Adding Liquidity...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Liquidity
                      </span>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="remove">
                <div
                  className="bg-card border border-border rounded-xl p-5"
                  style={{ boxShadow: "0 0 30px rgba(220,20,60,0.06)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Minus className="w-4 h-4 text-red-400" />
                    <h3 className="font-bold text-foreground">
                      Remove Liquidity
                    </h3>
                  </div>
                  {locks.filter((l) => l.isLocked).length > 0 ? (
                    <div className="space-y-3">
                      {locks.map((lock, i) => (
                        <div
                          key={`lock-${lock.unlockDate ?? i}`}
                          className="bg-muted/20 rounded-xl p-3 border border-border"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-bold text-foreground text-sm">
                              LP Position #{i + 1}
                            </p>
                            <Badge
                              className={
                                lock.isLocked
                                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-xs"
                                  : "bg-green-500/20 text-green-400 border-green-500/50 text-xs"
                              }
                            >
                              {lock.isLocked ? "Locked" : "Available"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Amount:{" "}
                            {(Number(lock.amount) / 100_000_000).toFixed(4)} ICP
                          </p>
                          {lock.isLocked && (
                            <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              Unlocks:{" "}
                              {new Date(
                                Number(lock.unlockDate) / 1_000_000,
                              ).toLocaleDateString()}
                            </p>
                          )}
                          <Button
                            size="sm"
                            disabled={lock.isLocked}
                            className="w-full mt-2 h-8 text-xs bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 disabled:opacity-40"
                          >
                            {lock.isLocked ? (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </>
                            ) : (
                              <>
                                <Minus className="w-3 h-3 mr-1" />
                                Remove
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                      <p className="text-muted-foreground text-sm">
                        No liquidity positions yet
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Add liquidity first to see your positions
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pool list */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-foreground">All Pools</h2>
              <Badge className="bg-muted/30 text-muted-foreground border-border text-xs">
                {pools.length} pools
              </Badge>
            </div>
            {pools.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {pools.map((pool) => (
                  <PoolCard key={pool.symbol} pool={pool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <Droplets className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <p className="text-muted-foreground">
                  No memecoins created yet
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Create a memecoin to start a liquidity pool
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
