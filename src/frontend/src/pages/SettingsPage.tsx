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
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Globe,
  Info,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiTelegram, SiX } from "react-icons/si";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetDepositAddress, useIsCEO } from "../hooks/useQueries";

const SOCIAL = {
  twitter: {
    label: "Twitter / X",
    href: "https://x.com/icpmemeworld?t=3Bbkhkdt1K5GEbF9hkIYKw&s=08",
    icon: SiX,
  },
  telegram: {
    label: "Telegram Community",
    href: "https://t.me/icpworldmemepad",
    icon: SiTelegram,
  },
};

function CopyableField({
  value,
  label,
  hint,
}: { value: string; label: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  const isValid =
    value &&
    !value.startsWith("Loading") &&
    !value.startsWith("Canister") &&
    value.length > 5;

  const handleCopy = async () => {
    if (!isValid) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 p-3 rounded-lg bg-black/60 border-2 border-primary/30 min-h-[52px] flex items-center overflow-hidden">
          <code className="text-primary font-mono text-xs break-all leading-relaxed">
            {value}
          </code>
        </div>
        <Button
          size="icon"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 shrink-0 h-auto"
          disabled={!isValid}
          onClick={handleCopy}
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [canisterId, setCanisterId] = useState("");
  const [canisterLoading, setCanisterLoading] = useState(true);
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: isCEO, isLoading: isCEOLoading } = useIsCEO();
  const { data: depositAddress = "", isLoading: depositLoading } =
    useGetDepositAddress();

  const principalId = identity?.getPrincipal().toString() || "Not logged in";

  // Fetch canister ID via getActorId backend method
  useEffect(() => {
    if (!actor || actorFetching) return;
    setCanisterLoading(true);
    actor
      .getActorId()
      .then((id: string) => {
        if (id && id.length > 5) {
          setCanisterId(id);
        } else {
          setCanisterId("Canister ID available after deployment");
        }
      })
      .catch(() => {
        // Fallback to env var
        const envId = import.meta.env.VITE_BACKEND_CANISTER_ID;
        setCanisterId(
          envId && envId.length > 5 ? envId : "Deploy app to see canister ID",
        );
      })
      .finally(() => setCanisterLoading(false));
  }, [actor, actorFetching]);

  const isValidCanister =
    canisterId &&
    canisterId.length > 10 &&
    !canisterId.startsWith("Deploy") &&
    !canisterId.startsWith("Canister ID available");

  const handleRefreshCanister = () => {
    if (!actor) return;
    setCanisterLoading(true);
    actor
      .getActorId()
      .then((id: string) => {
        if (id && id.length > 5) setCanisterId(id);
      })
      .catch(console.error)
      .finally(() => setCanisterLoading(false));
  };

  return (
    <div
      className="min-h-screen bg-background py-10 px-4"
      data-ocid="settings-page"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-9 w-9 text-primary" />
            App Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Platform configuration, wallet info, and technical details for
            ICPWorldMemepad
          </p>
        </div>

        {/* CEO Badge */}
        {!isCEOLoading && isCEO && (
          <Alert
            className="border-2 border-primary/60 bg-primary/10"
            data-ocid="ceo-settings-badge"
          >
            <Crown className="h-5 w-5 text-primary" />
            <AlertDescription className="font-bold text-primary text-base">
              🎖️ CEO Status Active — Akmal Bhutta — Lifetime Free Access to all
              platform features!
            </AlertDescription>
          </Alert>
        )}

        {/* ── BACKEND CANISTER INFO ────────────────────────────── */}
        <Card
          className="border-2 border-primary/40"
          data-ocid="canister-info-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Motoko Backend Canister
            </CardTitle>
            <CardDescription>
              Use this canister ID to list your app on DappRadar and other Web3
              directories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  ICP Blockchain Canister ID
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshCanister}
                  disabled={canisterLoading || actorFetching}
                  className="h-7 text-xs gap-1 text-muted-foreground"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${canisterLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              <div className="flex items-stretch gap-2">
                <div className="flex-1 p-4 rounded-xl bg-black border-2 border-primary/50 min-h-[64px] flex items-center">
                  {canisterLoading ? (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-mono text-sm">
                        Loading canister ID...
                      </span>
                    </div>
                  ) : (
                    <code className="text-primary font-mono text-sm break-all">
                      {canisterId}
                    </code>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary/40 text-primary hover:bg-primary/10 h-auto shrink-0"
                  disabled={!isValidCanister || canisterLoading}
                  onClick={async () => {
                    if (!isValidCanister) return;
                    await navigator.clipboard.writeText(canisterId);
                    toast.success("Canister ID copied!");
                  }}
                  data-ocid="copy-canister-btn"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {!isValidCanister && !canisterLoading && (
                <Alert className="border-yellow-600/50 bg-yellow-600/10">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-sm text-yellow-200">
                    The canister ID is available once your app is deployed to
                    the Internet Computer network.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator className="border-primary/20" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Use on DappRadar and dapp directories",
                "Required for blockchain explorer lookups",
                "All transactions executed on this canister",
                "Unique 64-char deposit address per user",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── WALLET & IDENTITY ───────────────────────────────── */}
        <Card
          className="border-2 border-accent/30"
          data-ocid="wallet-identity-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5 text-accent" />
              Wallet & Identity
            </CardTitle>
            <CardDescription>
              Your connected identity and deposit address details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <CopyableField
              label="Your Principal ID"
              value={principalId}
              hint="Your unique identity on the Internet Computer blockchain"
            />

            <CopyableField
              label="Your ICP Deposit Address"
              value={
                depositLoading
                  ? "Loading deposit address..."
                  : depositAddress || "Login to see your deposit address"
              }
              hint="64-character hex ICP Ledger address — send ICP from exchanges or wallets to this address"
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Connection Type
              </p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">
                  Internet Identity (ICP Blockchain)
                </span>
                <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── CEO PRIVILEGES ──────────────────────────────────── */}
        <Card
          className="border-2 border-primary/20"
          data-ocid="ceo-privileges-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className="h-5 w-5 text-primary" />
              CEO Privileges — Akmal Bhutta
            </CardTitle>
            <CardDescription>
              Lifetime free access to all platform features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-xl border-2 ${isCEO ? "border-primary/50 bg-primary/5" : "border-border/50 bg-muted/10"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown
                  className={`h-5 w-5 ${isCEO ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`font-bold ${isCEO ? "text-primary" : "text-muted-foreground"}`}
                >
                  {isCEO
                    ? "✓ CEO Lifetime Free Access Enabled"
                    : "CEO Status: Not Active for this account"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    label: "Create memecoins for free",
                    detail: "No 2 ICP creation fee",
                  },
                  {
                    label: "All premium services free",
                    detail: "Full platform access",
                  },
                  {
                    label: "Exempt from ownership limits",
                    detail: "No 30% cap restriction",
                  },
                  { label: "Zero trading fees", detail: "On all transactions" },
                  {
                    label: "Lifetime access",
                    detail: "Permanent premium status",
                  },
                  {
                    label: "Priority support",
                    detail: "Dedicated CEO channel",
                  },
                ].map(({ label, detail }) => (
                  <div key={label} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${isCEO ? "text-primary" : "text-muted-foreground/50"}`}
                    />
                    <div>
                      <span
                        className={
                          isCEO
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {label}
                      </span>
                      <span className="text-muted-foreground/70 text-xs ml-1">
                        — {detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── PLATFORM FEATURES ───────────────────────────────── */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "ICP Blockchain", sub: "Fully connected" },
                { label: "Wallet System", sub: "Unique 64-char addresses" },
                { label: "Icpswap DEX", sub: "Trading enabled" },
                { label: "Liquidity Pools", sub: "ICP pairs active" },
                { label: "Token Swaps", sub: "ICP ↔ Memecoin" },
                { label: "AI Features", sub: "All modules live" },
                { label: "Referral System", sub: "Stable & shareable" },
                { label: "Internet Identity", sub: "Authentication ready" },
                { label: "Public Access", sub: "Global availability" },
              ].map(({ label, sub }) => (
                <div
                  key={label}
                  className="p-3 rounded-lg bg-muted/20 border border-primary/20 space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
                    <span className="text-xs font-semibold text-foreground">
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── PLATFORM VISIBILITY ─────────────────────────────── */}
        <Card className="border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 text-green-400" />
              App Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-green-500/10 border-2 border-green-500/30">
              <p className="text-green-400 font-bold flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5" /> Public Access Enabled
              </p>
              <p className="text-sm text-muted-foreground">
                ICPWorldMemepad is publicly accessible at{" "}
                <a
                  href="https://icpmemeworld-65u.caffeine.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  icpmemeworld-65u.caffeine.xyz
                </a>
                . All users worldwide can open the app, sign up, and use all
                features without restrictions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── QUICK LINKS ─────────────────────────────────────── */}
        <Card className="border-2 border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ExternalLink className="h-5 w-5 text-accent" />
              Official Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(SOCIAL).map(
              ([key, { label, href, icon: Icon }]) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-accent/20 hover:border-accent/50 hover:bg-accent/5 transition-colors group"
                  data-ocid={`social-${key}-link`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="text-foreground font-medium">{label}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </a>
              ),
            )}

            <div className="pt-2 text-center">
              <p className="text-xs text-muted-foreground">
                ICPWorldMemepad v64 — Built on Internet Computer Protocol (ICP)
                — All features live
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
