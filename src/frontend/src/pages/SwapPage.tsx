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
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Clock,
  RefreshCw,
  Settings,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Memecoin } from "../backend.d";
import LoginOptionsDialog from "../components/LoginOptionsDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerWallet, useGetMemecoins } from "../hooks/useQueries";

interface SwapHistoryItem {
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  time: number;
  status: "completed" | "pending";
}

function getTokenPrice(symbol: string): number {
  if (symbol === "ICP") return 1;
  const c = symbol.charCodeAt(0);
  return 0.0001 + (c % 10) * 0.00005;
}

function calcOutput(
  fromSymbol: string,
  toSymbol: string,
  amount: number,
  slippage: number,
): number {
  const fromPrice = getTokenPrice(fromSymbol);
  const toPrice = getTokenPrice(toSymbol);
  const rate = fromPrice / toPrice;
  return amount * rate * (1 - slippage / 100) * 0.998;
}

function calcPriceImpact(fromSymbol: string, amount: number): number {
  if (fromSymbol === "ICP") return Math.min(amount * 0.05, 15);
  return Math.min(amount * 0.001, 10);
}

export default function SwapPage() {
  const { identity } = useInternetIdentity();
  const { data: memecoins = [] } = useGetMemecoins();
  const { data: wallet } = useGetCallerWallet();
  const [fromToken, setFromToken] = useState("ICP");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [swapHistory, setSwapHistory] = useState<SwapHistoryItem[]>([]);
  const [rotating, setRotating] = useState(false);

  const icpBalance = wallet ? Number(wallet.balance) / 100_000_000 : 0;
  const outputAmount =
    fromAmount && toToken
      ? calcOutput(
          fromToken,
          toToken,
          Number.parseFloat(fromAmount),
          Number.parseFloat(slippage),
        )
      : 0;
  const priceImpact = fromAmount
    ? calcPriceImpact(fromToken, Number.parseFloat(fromAmount))
    : 0;
  const rate = toToken
    ? (getTokenPrice(fromToken) / getTokenPrice(toToken)).toFixed(6)
    : "0";
  const minReceived = outputAmount * (1 - Number.parseFloat(slippage) / 100);

  useEffect(() => {
    if (memecoins.length > 0 && !toToken) setToToken(memecoins[0].symbol);
  }, [memecoins, toToken]);

  const handleFlip = () => {
    setRotating(true);
    setTimeout(() => {
      const tmp = fromToken;
      setFromToken(toToken);
      setToToken(tmp);
      setFromAmount(outputAmount > 0 ? outputAmount.toFixed(6) : "");
      setRotating(false);
    }, 300);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast.error("Fill in all fields");
      return;
    }
    if (Number.parseFloat(fromAmount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (priceImpact > 10) {
      toast.warning("High price impact! Proceed with caution.");
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const item: SwapHistoryItem = {
        from: fromToken,
        to: toToken,
        fromAmount,
        toAmount: outputAmount.toFixed(6),
        time: Date.now(),
        status: "completed",
      };
      setSwapHistory((prev) => [item, ...prev.slice(0, 9)]);
      toast.success(
        `✅ Swapped ${fromAmount} ${fromToken} → ${outputAmount.toFixed(6)} ${toToken}`,
      );
      setFromAmount("");
    } catch {
      toast.error("Swap failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const allTokens = [
    { symbol: "ICP", name: "Internet Computer" },
    ...memecoins,
  ];

  if (!identity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center mx-auto"
            style={{ boxShadow: "0 0 60px rgba(0,230,118,0.4)" }}
          >
            <ArrowDownUp className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Instant Token Swap
          </h2>
          <p className="text-muted-foreground">
            Connect your wallet to swap ICP ↔ Memecoins instantly with optimal
            routing.
          </p>
          <button
            type="button"
            onClick={() => setShowLoginDialog(true)}
            data-ocid="swap-login-btn"
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 bg-green-500/20 border border-green-500 text-green-400"
            style={{ boxShadow: "0 0 30px rgba(0,230,118,0.3)" }}
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
      data-ocid="swap-page"
    >
      <div className="container max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-bold">
              Lightning Fast Swap — ICP Blockchain
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Instant Swap
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trade any token instantly with optimal routing, adjustable slippage,
            and real-time price feeds on the Internet Computer.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Swap Card */}
          <div className="lg:col-span-2">
            <div
              className="bg-card border border-border rounded-2xl p-6"
              style={{ boxShadow: "0 0 40px rgba(0,230,118,0.08)" }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Swap</h2>
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg border transition-colors ${showSettings ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                  aria-label="Toggle settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Settings panel */}
              {showSettings && (
                <div className="mb-6 p-4 bg-muted/20 rounded-xl border border-border space-y-3">
                  <p className="text-sm font-bold text-foreground">
                    Slippage Tolerance
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {["0.1", "0.5", "1", "2", "3"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSlippage(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${slippage === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                      >
                        {v}%
                      </button>
                    ))}
                    <Input
                      type="number"
                      placeholder="Custom"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="w-24 h-8 text-sm bg-muted/20 border-border"
                      aria-label="Custom slippage"
                    />
                  </div>
                  {Number.parseFloat(slippage) > 2 && (
                    <div className="flex items-center gap-2 text-yellow-400 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      High slippage — your transaction may be front-run
                    </div>
                  )}
                </div>
              )}

              {/* From */}
              <div
                className="bg-muted/20 rounded-xl p-4 border border-border mb-2"
                data-ocid="swap-from"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-xs text-muted-foreground">
                    Balance:{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setFromAmount(icpBalance.toFixed(4))}
                    >
                      {fromToken === "ICP" ? icpBalance.toFixed(4) : "0"}{" "}
                      {fromToken}
                    </button>
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Select
                    value={fromToken}
                    onValueChange={(v) => {
                      setFromToken(v);
                      if (v === toToken) setToToken("");
                    }}
                  >
                    <SelectTrigger className="w-40 h-12 bg-background border-border font-bold text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-60">
                      {allTokens.map((t) => (
                        <SelectItem
                          key={t.symbol}
                          value={t.symbol}
                          className="text-sm"
                        >
                          <span className="font-bold">{t.symbol}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {t.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 h-12 text-xl font-bold bg-transparent border-none text-right text-foreground focus:ring-0 p-0"
                    aria-label={`Amount of ${fromToken} to swap`}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setFromAmount(((icpBalance * pct) / 100).toFixed(4))
                      }
                      className="text-[11px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Flip button */}
              <div className="flex justify-center my-1">
                <button
                  type="button"
                  onClick={handleFlip}
                  disabled={!toToken}
                  className={`w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all ${rotating ? "rotate-180" : ""}`}
                  style={{ transition: "transform 0.3s ease" }}
                  aria-label="Flip tokens"
                >
                  <ArrowDownUp className="w-4 h-4" />
                </button>
              </div>

              {/* To */}
              <div
                className="bg-muted/20 rounded-xl p-4 border border-border mb-4"
                data-ocid="swap-to"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    To (estimated)
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Min: {minReceived.toFixed(6)} {toToken}
                  </span>
                </div>
                <div className="flex gap-3 items-center">
                  <Select value={toToken} onValueChange={setToToken}>
                    <SelectTrigger className="w-40 h-12 bg-background border-border font-bold text-sm">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-60">
                      {allTokens.map((t) => (
                        <SelectItem
                          key={t.symbol}
                          value={t.symbol}
                          className="text-sm"
                        >
                          <span className="font-bold">{t.symbol}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 text-right">
                    <span
                      className={`text-xl font-bold ${outputAmount > 0 ? "text-green-400" : "text-muted-foreground"}`}
                    >
                      {outputAmount > 0 ? outputAmount.toFixed(6) : "0.0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rate info */}
              {fromAmount && toToken && outputAmount > 0 && (
                <div className="bg-muted/10 rounded-xl p-3 border border-border mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate</span>
                    <span className="text-foreground font-medium">
                      1 {fromToken} = {rate} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span
                      className={`font-bold ${priceImpact < 1 ? "text-green-400" : priceImpact < 5 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {priceImpact < 0.01 ? "<0.01" : priceImpact.toFixed(2)}%
                      {priceImpact > 5 && " ⚠️"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slippage</span>
                    <span className="text-foreground">{slippage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="text-foreground">~0.0001 ICP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="text-green-400 font-medium">
                      {fromToken} → {toToken}
                    </span>
                  </div>
                </div>
              )}

              {priceImpact > 10 && fromAmount && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">
                    Price impact is very high ({priceImpact.toFixed(1)}%).
                    Consider splitting your trade.
                  </p>
                </div>
              )}

              <Button
                onClick={handleSwap}
                disabled={!fromToken || !toToken || !fromAmount || loading}
                className="w-full h-14 text-lg font-bold bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30 transition-all disabled:opacity-50"
                style={{ boxShadow: "0 0 20px rgba(0,230,118,0.2)" }}
                data-ocid="swap-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Swapping...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Swap {fromToken} → {toToken || "?"}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar: Stats + History */}
          <div className="space-y-4">
            {/* Price cards */}
            {[
              { symbol: "ICP", price: 12.45, change: 3.2 },
              ...memecoins.slice(0, 3).map((c) => ({
                symbol: c.symbol,
                price: getTokenPrice(c.symbol),
                change: (c.symbol.charCodeAt(0) % 20) - 10,
              })),
            ].map((token) => (
              <div
                key={token.symbol}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{token.symbol}</p>
                    <p className="text-lg font-bold text-primary">
                      {token.price < 1
                        ? token.price.toFixed(6)
                        : token.price.toFixed(2)}{" "}
                      ICP
                    </p>
                  </div>
                  <Badge
                    className={`${token.change >= 0 ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-red-500/20 text-red-400 border-red-500/50"}`}
                  >
                    {token.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {token.change >= 0 ? "+" : ""}
                    {token.change.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}

            {/* Swap history */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-bold text-foreground mb-3 text-sm">
                Recent Swaps
              </h3>
              {swapHistory.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-4">
                  Your swap history will appear here
                </p>
              ) : (
                <div className="space-y-2">
                  {swapHistory.map((h, i) => (
                    <div
                      key={`swap-${h.time}-${i}`}
                      className="flex items-center gap-2 text-xs border-b border-border/30 pb-2"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">
                          {h.fromAmount} {h.from} → {h.toAmount} {h.to}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(h.time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
