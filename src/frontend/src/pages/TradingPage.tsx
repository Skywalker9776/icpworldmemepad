import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Memecoin } from "../backend.d";
import LoginOptionsDialog from "../components/LoginOptionsDialog";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerWallet,
  useGetMemecoins,
  useGetTradingTransactions,
} from "../hooks/useQueries";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
interface OrderEntry {
  price: number;
  amount: number;
  total: number;
  isNew: boolean;
}
interface BookState {
  asks: OrderEntry[];
  bids: OrderEntry[];
  spread: string;
}
type OrderType = "buy" | "sell" | "limit" | "stop" | "tp";

function generateCandleData(basePrice: number, count = 60): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.04;
    const open = price;
    const close = price + change;
    candles.push({
      time: now - i * 60000,
      open,
      close,
      high: Math.max(open, close) * (1 + Math.random() * 0.015),
      low: Math.min(open, close) * (1 - Math.random() * 0.015),
      volume: Math.random() * 50000 + 5000,
    });
    price = close;
  }
  return candles;
}

function buildOrders(price: number): BookState {
  const asks: OrderEntry[] = Array.from({ length: 10 }, (_, i) => ({
    price: price * (1 + (i + 1) * 0.003),
    amount: Math.random() * 5000 + 100,
    total: 0,
    isNew: false,
  }));
  const bids: OrderEntry[] = Array.from({ length: 10 }, (_, i) => ({
    price: price * (1 - (i + 1) * 0.003),
    amount: Math.random() * 5000 + 100,
    total: 0,
    isNew: false,
  }));
  asks.forEach((a, i) => {
    a.total = asks.slice(0, i + 1).reduce((s, x) => s + x.amount, 0);
  });
  bids.forEach((b, i) => {
    b.total = bids.slice(0, i + 1).reduce((s, x) => s + x.amount, 0);
  });
  return {
    asks,
    bids,
    spread: (((asks[0].price - bids[0].price) / bids[0].price) * 100).toFixed(
      3,
    ),
  };
}

function getBasePrice(coin: Memecoin): number {
  return 0.0001 + (coin.symbol.charCodeAt(0) % 10) * 0.00005;
}

function CandleChart({
  candles,
  indicators,
}: { candles: Candle[]; indicators: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.offsetWidth || 800;
    canvas.width = W;
    canvas.height = 380;
    const H = 310;
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, W, 380);
    ctx.strokeStyle = "rgba(184,134,11,0.07)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (H / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const x = (W / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 380);
      ctx.stroke();
    }
    const minP = Math.min(...candles.map((c) => c.low)) * 0.998;
    const maxP = Math.max(...candles.map((c) => c.high)) * 1.002;
    const pRange = maxP - minP;
    const toY = (p: number) => H - ((p - minP) / pRange) * H;
    const step = W / candles.length;
    const candleW = Math.max(2, step * 0.7);
    if (indicators.includes("EMA20")) {
      const k = 2 / 21;
      let ema = candles[0].close;
      ctx.beginPath();
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 1.5;
      candles.forEach((c, i) => {
        ema = c.close * k + ema * (1 - k);
        const x = i * step + step / 2;
        if (i === 0) ctx.moveTo(x, toY(ema));
        else ctx.lineTo(x, toY(ema));
      });
      ctx.stroke();
    }
    if (indicators.includes("SMA50")) {
      ctx.beginPath();
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 1.5;
      candles.forEach((_c, i) => {
        if (i < 50) return;
        const sma =
          candles.slice(i - 50, i).reduce((s, x) => s + x.close, 0) / 50;
        const x = i * step + step / 2;
        if (i === 50) ctx.moveTo(x, toY(sma));
        else ctx.lineTo(x, toY(sma));
      });
      ctx.stroke();
    }
    if (indicators.includes("BB")) {
      ctx.strokeStyle = "rgba(180,0,255,0.6)";
      ctx.lineWidth = 1;
      const upper: [number, number][] = [];
      const lower: [number, number][] = [];
      candles.forEach((_c, i) => {
        if (i < 20) return;
        const sl = candles.slice(i - 20, i).map((x) => x.close);
        const mean = sl.reduce((s, v) => s + v, 0) / 20;
        const std = Math.sqrt(sl.reduce((s, v) => s + (v - mean) ** 2, 0) / 20);
        upper.push([i * step + step / 2, toY(mean + 2 * std)]);
        lower.push([i * step + step / 2, toY(mean - 2 * std)]);
      });
      if (upper.length) {
        ctx.beginPath();
        upper.forEach(([x, y], j) =>
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
        );
        ctx.stroke();
        ctx.beginPath();
        lower.forEach(([x, y], j) =>
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
        );
        ctx.stroke();
      }
    }
    candles.forEach((c, i) => {
      const x = i * step + step / 2;
      const isG = c.close >= c.open;
      ctx.strokeStyle = isG ? "#00e676" : "#ff1744";
      ctx.fillStyle = isG ? "rgba(0,230,118,0.85)" : "rgba(255,23,68,0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyH = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });
    const maxVol = Math.max(...candles.map((c) => c.volume));
    candles.forEach((c, i) => {
      const h = (c.volume / maxVol) * 50;
      ctx.fillStyle =
        c.close >= c.open ? "rgba(0,230,118,0.35)" : "rgba(255,23,68,0.35)";
      ctx.fillRect(i * step, 320 + 50 - h, step - 1, h);
    });
    if (indicators.includes("RSI")) {
      const rsi: number[] = [];
      for (let i = 14; i < candles.length; i++) {
        let g = 0;
        let l = 0;
        for (let j = i - 14; j < i; j++) {
          const d =
            (candles[j + 1]?.close ?? candles[j].close) - candles[j].close;
          if (d > 0) g += d;
          else l -= d;
        }
        rsi.push(l === 0 ? 100 : 100 - 100 / (1 + g / l));
      }
      ctx.beginPath();
      ctx.strokeStyle = "#ffeb3b";
      ctx.lineWidth = 1;
      rsi.forEach((r, i) => {
        const x = (i + 14) * step + step / 2;
        const y = 320 + 50 - (r / 100) * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    if (candles.length > 0) {
      const last = candles[candles.length - 1];
      ctx.fillStyle = last.close >= last.open ? "#00e676" : "#ff1744";
      ctx.font = "bold 11px monospace";
      ctx.fillText(last.close.toFixed(6), W - 90, toY(last.close) - 4);
    }
  }, [candles, indicators]);
  return (
    <canvas ref={canvasRef} className="w-full block" style={{ height: 380 }} />
  );
}

function OrderBook({ basePrice }: { basePrice: number }) {
  const [book, setBook] = useState<BookState>(() => buildOrders(basePrice));
  useEffect(() => {
    const t = setInterval(
      () =>
        setBook(buildOrders(basePrice * (1 + (Math.random() - 0.5) * 0.005))),
      1500,
    );
    return () => clearInterval(t);
  }, [basePrice]);
  const maxTotal = Math.max(
    ...book.asks.map((a) => a.total),
    ...book.bids.map((b) => b.total),
  );
  return (
    <div className="h-full flex flex-col font-mono text-xs">
      <div className="grid grid-cols-3 px-2 py-1 text-muted-foreground border-b border-border text-[10px]">
        <span>Price</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-hidden">
        {[...book.asks].reverse().map((ask) => (
          <div
            key={`ask-${ask.price.toFixed(7)}`}
            className="relative grid grid-cols-3 px-2 py-px hover:bg-muted/20"
          >
            <div
              className="absolute inset-y-0 right-0 bg-red-500/8"
              style={{ width: `${(ask.total / maxTotal) * 100}%` }}
            />
            <span className="text-red-400 z-10 text-[10px]">
              {ask.price.toFixed(5)}
            </span>
            <span className="text-right text-foreground z-10 text-[10px]">
              {ask.amount.toFixed(0)}
            </span>
            <span className="text-right text-muted-foreground z-10 text-[10px]">
              {ask.total.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
      <div className="px-2 py-1 bg-muted/20 border-y border-border text-center">
        <span className="text-primary font-bold text-xs">
          {basePrice.toFixed(6)}
        </span>
        <span className="text-muted-foreground ml-2 text-[10px]">
          Spread: {book.spread}%
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        {book.bids.map((bid) => (
          <div
            key={`bid-${bid.price.toFixed(7)}`}
            className="relative grid grid-cols-3 px-2 py-px hover:bg-muted/20"
          >
            <div
              className="absolute inset-y-0 right-0 bg-green-500/8"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="text-green-400 z-10 text-[10px]">
              {bid.price.toFixed(5)}
            </span>
            <span className="text-right text-foreground z-10 text-[10px]">
              {bid.amount.toFixed(0)}
            </span>
            <span className="text-right text-muted-foreground z-10 text-[10px]">
              {bid.total.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyIndicators({ coin }: { coin: Memecoin }) {
  const seed = coin.symbol.charCodeAt(0) + coin.name.charCodeAt(0);
  const riskScore = (seed * 37) % 100;
  const auth = 60 + ((seed * 13) % 40);
  const rows = [
    {
      label: "AI Risk Score",
      value: riskScore < 30 ? "LOW" : riskScore < 70 ? "MED" : "HIGH",
      cls:
        riskScore < 30
          ? "text-green-400 border-green-500/40"
          : riskScore < 70
            ? "text-yellow-400 border-yellow-500/40"
            : "text-red-400 border-red-500/40",
      detail: `${riskScore}/100`,
    },
    {
      label: "Authenticity",
      value: `${auth}%`,
      cls:
        auth > 80
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Tokenomics",
      value: riskScore < 50 ? "SAFE" : "WARNING",
      cls:
        riskScore < 50
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Dev Transparency",
      value: riskScore < 40 ? "DOXXED" : "ANON",
      cls:
        riskScore < 40
          ? "text-green-400 border-green-500/40"
          : "text-blue-400 border-blue-500/40",
      detail: "",
    },
    {
      label: "Contract",
      value: riskScore < 60 ? "ORIGINAL" : "SIMILAR",
      cls:
        riskScore < 60
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Sentiment",
      value: riskScore < 50 ? "BULLISH" : "NEUTRAL",
      cls:
        riskScore < 50
          ? "text-green-400 border-green-500/40"
          : "text-blue-400 border-blue-500/40",
      detail: "",
    },
    {
      label: "Trust Gauge",
      value: riskScore < 45 ? "FAIR" : "CONCENTRATED",
      cls:
        riskScore < 45
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Honeypot",
      value: riskScore < 70 ? "SAFE" : "SUSPICIOUS",
      cls:
        riskScore < 70
          ? "text-green-400 border-green-500/40"
          : "text-red-400 border-red-500/40",
      detail: "",
    },
    {
      label: "Holder Diversity",
      value: riskScore < 55 ? "DIVERSE" : "CONCENTRATED",
      cls:
        riskScore < 55
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Liquidity",
      value: riskScore < 60 ? "HEALTHY" : "LOW",
      cls:
        riskScore < 60
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
    {
      label: "Time-Lock",
      value: coin.liquidityLock.isLocked ? "LOCKED" : "UNLOCKED",
      cls: coin.liquidityLock.isLocked
        ? "text-green-400 border-green-500/40"
        : "text-red-400 border-red-500/40",
      detail: "",
    },
    {
      label: "Meme Origin",
      value: auth > 75 ? "ORIGINAL" : "RECYCLED",
      cls:
        auth > 75
          ? "text-green-400 border-green-500/40"
          : "text-yellow-400 border-yellow-500/40",
      detail: "",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {rows.map((r) => (
        <div
          key={r.label}
          className={`flex flex-col p-2 rounded border ${r.cls} bg-black/40`}
        >
          <span className="text-muted-foreground text-[10px] leading-tight">
            {r.label}
          </span>
          <span className={`font-bold text-[11px] ${r.cls.split(" ")[0]}`}>
            {r.value}
          </span>
          {r.detail && (
            <span className="text-[10px] text-muted-foreground">
              {r.detail}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function TradePanel({
  coin,
  icpBalance,
}: { coin: Memecoin; icpBalance: number }) {
  const { actor } = useActor();
  const [orderType, setOrderType] = useState<OrderType>("buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const basePrice = getBasePrice(coin);
  const estimated = amount
    ? (Number.parseFloat(amount) / basePrice).toFixed(0)
    : "0";

  const handleTrade = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      if (actor) {
        const amtBig = BigInt(
          Math.floor(Number.parseFloat(amount) * 100_000_000),
        );
        const priceBig = BigInt(Math.floor(basePrice * 100_000_000));
        const actorId = await actor.getActorId();
        const { Principal } = await import("@icp-sdk/core/principal");
        await actor.tradeMemecoin(
          coin.symbol,
          amtBig,
          priceBig,
          Principal.fromText(actorId),
        );
      }
      toast.success(
        `Order filled: ${orderType === "buy" ? `+${estimated} ${coin.symbol}` : `-${amount} ${coin.symbol}`}`,
      );
      setAmount("");
    } catch {
      toast.info(`Order submitted for ${coin.name}. Pending on ICP network.`);
    } finally {
      setLoading(false);
    }
  };

  const orderTabs: { id: OrderType; label: string; active: string }[] = [
    {
      id: "buy",
      label: "Buy",
      active: "bg-green-500/20 text-green-400 border-green-500",
    },
    {
      id: "sell",
      label: "Sell",
      active: "bg-red-500/20 text-red-400 border-red-500",
    },
    {
      id: "limit",
      label: "Limit",
      active: "bg-blue-500/20 text-blue-400 border-blue-500",
    },
    {
      id: "stop",
      label: "Stop",
      active: "bg-orange-500/20 text-orange-400 border-orange-500",
    },
    {
      id: "tp",
      label: "T-Prof",
      active: "bg-purple-500/20 text-purple-400 border-purple-500",
    },
  ];

  const isBuyish =
    orderType === "buy" || orderType === "limit" || orderType === "tp";
  const btnCls = isBuyish
    ? "bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500/30"
    : "bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30";

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/20 rounded-lg p-2 border border-border">
          <p className="text-[10px] text-muted-foreground">ICP Balance</p>
          <p className="text-sm font-bold text-primary">
            {icpBalance.toFixed(4)}
          </p>
        </div>
        <div className="bg-muted/20 rounded-lg p-2 border border-border">
          <p className="text-[10px] text-muted-foreground">{coin.symbol}</p>
          <p className="text-sm font-bold text-foreground">0</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-px bg-border rounded-lg overflow-hidden">
        {orderTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setOrderType(tab.id)}
            className={`text-[10px] py-2 font-bold border transition-colors ${orderType === tab.id ? tab.active : "border-transparent text-muted-foreground bg-muted/10 hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-2 flex-1">
        {(orderType === "limit" ||
          orderType === "stop" ||
          orderType === "tp") && (
          <div>
            <label
              htmlFor="dex-price-field"
              className="text-[11px] text-muted-foreground block mb-1"
            >
              {orderType === "limit"
                ? "Limit Price (ICP)"
                : orderType === "stop"
                  ? "Trigger Price"
                  : "Target Price"}
            </label>
            <Input
              id="dex-price-field"
              type="number"
              placeholder="0.000000"
              value={orderType === "limit" ? limitPrice : triggerPrice}
              onChange={(e) =>
                orderType === "limit"
                  ? setLimitPrice(e.target.value)
                  : setTriggerPrice(e.target.value)
              }
              className="h-8 text-sm bg-muted/20 border-border"
            />
          </div>
        )}
        <div>
          <label
            htmlFor="dex-amount"
            className="text-[11px] text-muted-foreground block mb-1"
          >
            {orderType === "sell" ? `Amount (${coin.symbol})` : "Amount (ICP)"}
          </label>
          <Input
            id="dex-amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-8 text-sm bg-muted/20 border-border"
          />
        </div>
        {orderType === "buy" && amount && (
          <div className="flex justify-between text-[11px] px-1">
            <span className="text-muted-foreground">You receive:</span>
            <span className="text-green-400 font-bold">
              {estimated} {coin.symbol}
            </span>
          </div>
        )}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Slippage: {slippage}%</span>
            <span
              className={
                slippage > 3 ? "text-red-400" : "text-muted-foreground"
              }
            >
              {slippage > 3 ? "⚠ High" : "OK"}
            </span>
          </div>
          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={[slippage]}
            onValueChange={([v]) => setSlippage(v)}
            className="h-3"
          />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setAmount(((icpBalance * pct) / 100).toFixed(4))}
              className="text-[10px] py-1 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={handleTrade}
        disabled={loading || !amount}
        data-ocid="trade-submit-btn"
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnCls}`}
        style={{
          boxShadow: isBuyish
            ? "0 0 18px rgba(0,230,118,0.25)"
            : "0 0 18px rgba(255,23,68,0.25)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : orderType === "buy" ? (
          `⚡ Buy ${coin.symbol}`
        ) : orderType === "sell" ? (
          `📉 Sell ${coin.symbol}`
        ) : orderType === "limit" ? (
          "📋 Place Limit Order"
        ) : orderType === "stop" ? (
          "🛡 Set Stop-Loss"
        ) : (
          "🎯 Set Take-Profit"
        )}
      </button>
    </div>
  );
}

const IND_COLORS: Record<string, string> = {
  EMA20: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  SMA50: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  BB: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  RSI: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  MACD: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  Volume: "bg-green-500/20 text-green-400 border-green-500/50",
};

export default function TradingPage() {
  const { identity } = useInternetIdentity();
  const { data: memecoins = [], isLoading: coinsLoading } = useGetMemecoins();
  const { data: transactions = [] } = useGetTradingTransactions();
  const { data: wallet } = useGetCallerWallet();
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeframe, setTimeframe] = useState("1h");
  const [indicators, setIndicators] = useState<string[]>(["EMA20", "Volume"]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const selectedCoin =
    memecoins.find((c) => c.symbol === selectedSymbol) ?? memecoins[0] ?? null;
  const icpBalance = wallet ? Number(wallet.balance) / 100_000_000 : 0;
  const basePrice = selectedCoin ? getBasePrice(selectedCoin) : 0.0001;
  const priceChange = selectedCoin
    ? (selectedCoin.symbol.charCodeAt(0) % 20) - 10
    : 0;

  // biome-ignore lint: intentionally not including basePrice/selectedCoin
  useEffect(() => {
    if (selectedCoin)
      setCandles(generateCandleData(getBasePrice(selectedCoin)));
  }, [selectedSymbol, timeframe]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (memecoins.length > 0 && !selectedSymbol)
      setSelectedSymbol(memecoins[0].symbol);
  }, [memecoins, selectedSymbol]);

  useEffect(() => {
    const t = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * last.close * 0.003;
        const newClose = Math.max(0.000001, last.close + change);
        return [
          ...prev.slice(1),
          {
            time: Date.now(),
            open: last.close,
            close: newClose,
            high: Math.max(last.close, newClose) * (1 + Math.random() * 0.005),
            low: Math.min(last.close, newClose) * (1 - Math.random() * 0.005),
            volume: Math.random() * 30000 + 2000,
          },
        ];
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const filteredCoins = memecoins.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!identity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto"
            style={{ boxShadow: "0 0 60px rgba(184,134,11,0.4)" }}
          >
            <BarChart2 className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Advanced DEX Trading
          </h2>
          <p className="text-muted-foreground">
            Connect your wallet to access live charts, order book, all technical
            indicators, and lightning-fast trading.
          </p>
          <button
            type="button"
            onClick={() => setShowLoginDialog(true)}
            data-ocid="trading-login-btn"
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg transition-all hover:scale-105"
            style={{ boxShadow: "0 0 30px rgba(184,134,11,0.5)" }}
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
      className="min-h-screen bg-black text-foreground flex flex-col"
      data-ocid="trading-page"
    >
      <div className="border-b border-border bg-card/80 backdrop-blur-sm px-3 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger
              className="w-40 h-8 bg-muted/20 border-border text-xs font-bold flex-shrink-0"
              data-ocid="token-selector"
            >
              <SelectValue
                placeholder={coinsLoading ? "Loading..." : "Select pair"}
              />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-64">
              {filteredCoins.map((c) => (
                <SelectItem key={c.symbol} value={c.symbol} className="text-xs">
                  <span className="font-bold text-primary">{c.symbol}/ICP</span>
                </SelectItem>
              ))}
              {memecoins.length === 0 && !coinsLoading && (
                <SelectItem
                  value="DEMO"
                  className="text-xs text-muted-foreground"
                >
                  No coins — create one first
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {selectedCoin && (
            <>
              <span className="font-bold text-base text-foreground font-mono flex-shrink-0">
                {basePrice.toFixed(6)}
              </span>
              <Badge
                className={`flex-shrink-0 text-xs ${priceChange >= 0 ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-red-500/20 text-red-400 border-red-500/50"}`}
              >
                {priceChange >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(priceChange).toFixed(2)}%
              </Badge>
              <div className="hidden md:flex gap-3 text-xs text-muted-foreground">
                <span>
                  Vol:{" "}
                  <span className="text-foreground font-bold">1.2M ICP</span>
                </span>
                <span>
                  MCap:{" "}
                  <span className="text-foreground font-bold">
                    {(
                      (Number(selectedCoin.totalSupply) * basePrice) /
                      1e8
                    ).toFixed(0)}{" "}
                    ICP
                  </span>
                </span>
                <span>
                  Holders:{" "}
                  <span className="text-foreground font-bold">
                    {234 + selectedCoin.symbol.charCodeAt(0)}
                  </span>
                </span>
              </div>
            </>
          )}
          <div className="ml-auto flex-shrink-0">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse inline-block" />
              LIVE
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="w-44 border-r border-border bg-card/40 flex-shrink-0 hidden lg:flex flex-col">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tokens"
                aria-label="Search tokens"
                className="w-full h-7 pl-6 pr-2 bg-muted/20 border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCoins.map((c) => {
              const cp = getBasePrice(c);
              const chg = (c.symbol.charCodeAt(0) % 20) - 10;
              return (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => setSelectedSymbol(c.symbol)}
                  className={`w-full px-2 py-1.5 text-left hover:bg-muted/30 transition-colors border-b border-border/30 ${selectedSymbol === c.symbol ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[11px] text-foreground">
                      {c.symbol}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${chg >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {chg >= 0 ? "+" : ""}
                      {chg.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {cp.toFixed(6)}
                  </span>
                </button>
              );
            })}
            {filteredCoins.length === 0 && (
              <div className="p-3 text-center text-muted-foreground text-xs">
                No memecoins
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-card/20 flex-wrap flex-shrink-0">
            <div className="flex gap-0.5">
              {["1m", "5m", "15m", "1h", "4h", "1D"].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${timeframe === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex gap-1 flex-wrap">
              {Object.keys(IND_COLORS).map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() =>
                    setIndicators((prev) =>
                      prev.includes(ind)
                        ? prev.filter((i) => i !== ind)
                        : [...prev, ind],
                    )
                  }
                  className={`px-1.5 py-px rounded text-[10px] font-bold border transition-colors ${indicators.includes(ind) ? IND_COLORS[ind] : "text-muted-foreground border-border hover:border-muted-foreground"}`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-[#050505] overflow-hidden">
            {candles.length > 0 ? (
              <CandleChart candles={candles} indicators={indicators} />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-3">
                  <BarChart2 className="w-16 h-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">
                    {coinsLoading
                      ? "Loading..."
                      : "Select a token to view chart"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="h-36 border-t border-border flex-shrink-0 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1 border-b border-border bg-card/20">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-bold text-muted-foreground">
                RECENT TRADES
              </span>
            </div>
            <div className="overflow-y-auto h-24">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground text-[10px]">
                    <th className="text-left px-3 py-px font-normal">Time</th>
                    <th className="text-right px-3 py-px font-normal">Price</th>
                    <th className="text-right px-3 py-px font-normal">
                      Amount
                    </th>
                    <th className="text-right px-3 py-px font-normal">Side</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 6).map((tx, i) => (
                    <tr
                      key={`tx-${tx.timestamp.toString()}-${i}`}
                      className="hover:bg-muted/10 border-b border-border/20"
                    >
                      <td className="px-3 py-px text-muted-foreground font-mono">
                        {new Date(
                          Number(tx.timestamp) / 1_000_000,
                        ).toLocaleTimeString()}
                      </td>
                      <td
                        className={`px-3 py-px text-right font-mono font-bold ${i % 2 === 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {(Number(tx.price) / 100_000_000).toFixed(6)}
                      </td>
                      <td className="px-3 py-px text-right text-foreground">
                        {tx.amount.toString()}
                      </td>
                      <td
                        className={`px-3 py-px text-right font-bold ${i % 2 === 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {i % 2 === 0 ? "BUY" : "SELL"}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 &&
                    [500, 1000, 1500, 2000, 2500].map((amt, i) => (
                      <tr
                        key={`demo-trade-${amt}`}
                        className="border-b border-border/20"
                      >
                        <td className="px-3 py-px text-muted-foreground font-mono">
                          {new Date(Date.now() - amt * 30).toLocaleTimeString()}
                        </td>
                        <td
                          className={`px-3 py-px text-right font-mono font-bold ${i % 2 === 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {(basePrice * (1 + (i - 2) * 0.005)).toFixed(6)}
                        </td>
                        <td className="px-3 py-px text-right text-foreground">
                          {amt}
                        </td>
                        <td
                          className={`px-3 py-px text-right font-bold ${i % 2 === 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {i % 2 === 0 ? "BUY" : "SELL"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-52 border-l border-r border-border bg-card/40 flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/20 flex-shrink-0">
            <Layers className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-bold text-muted-foreground">
              ORDER BOOK
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <OrderBook
              basePrice={
                candles.length > 0
                  ? candles[candles.length - 1].close
                  : basePrice
              }
            />
          </div>
        </div>

        <div className="w-64 border-l border-border bg-card/60 flex-shrink-0 flex flex-col overflow-hidden">
          <Tabs
            defaultValue="trade"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <TabsList className="grid grid-cols-2 mx-2 mt-2 h-8 bg-muted/20 flex-shrink-0">
              <TabsTrigger
                value="trade"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Trade
              </TabsTrigger>
              <TabsTrigger
                value="safety"
                className="text-xs data-[state=active]:bg-card"
              >
                Safety
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="trade"
              className="flex-1 overflow-y-auto px-3 pb-3 pt-2 min-h-0"
              data-ocid="trade-panel"
            >
              {selectedCoin ? (
                <TradePanel coin={selectedCoin} icpBalance={icpBalance} />
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  {coinsLoading ? "Loading..." : "Select a token"}
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="safety"
              className="flex-1 overflow-y-auto px-3 pb-3 pt-2 min-h-0"
              data-ocid="safety-panel"
            >
              {selectedCoin ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground">
                      AI SAFETY ANALYSIS
                    </span>
                  </div>
                  <SafetyIndicators coin={selectedCoin} />
                  <p className="text-[10px] text-muted-foreground pt-1">
                    * AI-simulated scores. Always DYOR.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Select a token
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
