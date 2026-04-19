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
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  Gift,
  Info,
  Loader2,
  RefreshCw,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiFacebook, SiTelegram, SiWhatsapp, SiX } from "react-icons/si";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useGetReferralStats } from "../hooks/useQueries";

const BASE_URL = "https://icpmemeworld-65u.caffeine.xyz";

export default function ReferralShareCard() {
  const {
    data: referralStats,
    isLoading: statsLoading,
    refetch,
  } = useGetReferralStats();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [referralUrl, setReferralUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Build URL when stats are loaded
  useEffect(() => {
    if (referralStats?.referralCode) {
      setReferralUrl(`${BASE_URL}?ref=${referralStats.referralCode}`);
    }
  }, [referralStats]);

  // Auto-fetch or generate referral code on mount
  useEffect(() => {
    if (actorFetching || !actor || statsLoading || attempted) return;
    if (referralStats?.referralCode) return; // already have it

    setAttempted(true);
    const fetchOrGenerate = async () => {
      setGenerating(true);
      try {
        // getReferralCode returns existing code or creates new one
        const code = await actor.getReferralCode();
        if (code && code.length > 0) {
          setReferralUrl(`${BASE_URL}?ref=${code}`);
          queryClient.invalidateQueries({ queryKey: ["referralStats"] });
          setTimeout(() => refetch(), 500);
        }
      } catch (err) {
        console.error("Failed to fetch referral code:", err);
        // Fall back to generateReferralLink
        try {
          const code = await actor.generateReferralLink();
          if (code && code.length > 0) {
            setReferralUrl(`${BASE_URL}?ref=${code}`);
            queryClient.invalidateQueries({ queryKey: ["referralStats"] });
          }
        } catch (genErr) {
          console.error("Failed to generate referral link:", genErr);
          setAttempted(false); // allow retry
        }
      } finally {
        setGenerating(false);
      }
    };

    fetchOrGenerate();
  }, [
    actor,
    actorFetching,
    statsLoading,
    attempted,
    referralStats,
    refetch,
    queryClient,
  ]);

  const handleGenerate = async () => {
    if (!actor) return;
    setGenerating(true);
    try {
      const code = await actor.getReferralCode();
      if (code) {
        setReferralUrl(`${BASE_URL}?ref=${code}`);
        queryClient.invalidateQueries({ queryKey: ["referralStats"] });
        toast.success("Referral link ready! Share it to earn rewards.");
        setTimeout(() => refetch(), 500);
      }
    } catch {
      try {
        const code = await actor.generateReferralLink();
        if (code) {
          setReferralUrl(`${BASE_URL}?ref=${code}`);
          toast.success("Referral link generated!");
        }
      } catch {
        toast.error("Failed to generate referral link. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    const url =
      referralUrl ||
      (referralStats?.referralCode
        ? `${BASE_URL}?ref=${referralStats.referralCode}`
        : "");
    if (!url) {
      toast.error("No referral link available");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const url =
      referralUrl ||
      (referralStats?.referralCode
        ? `${BASE_URL}?ref=${referralStats.referralCode}`
        : "");
    if (!url) return;
    if (navigator.share) {
      await navigator.share({
        title: "ICPWorld MemePad",
        text: "Join me on ICPWorld MemePad — the AI-powered memecoin platform on ICP!",
        url,
      });
    } else {
      handleCopy();
    }
  };

  const handleSocialShare = (platform: string) => {
    const url = referralUrl || "";
    if (!url) {
      toast.error("No referral link available");
      return;
    }
    const text = encodeURIComponent(
      "🚀 Join ICPWorld MemePad — the world's first AI-powered memecoin launchpad on ICP!",
    );
    const encoded = encodeURIComponent(url);
    const map: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encoded}`,
    };
    if (map[platform])
      window.open(map[platform], "_blank", "width=600,height=400");
  };

  const displayUrl =
    referralUrl ||
    (referralStats?.referralCode
      ? `${BASE_URL}?ref=${referralStats.referralCode}`
      : "");
  const referredCount = referralStats?.referredUsers?.length ?? 0;
  const isLoading = statsLoading || generating;

  if (isLoading && !displayUrl) {
    return (
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="pt-6 flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Setting up your referral link...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-2 border-accent/40 bg-gradient-to-br from-accent/5 to-primary/5"
      data-ocid="referral-share-card"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Gift className="h-5 w-5 text-accent" />
            Your Referral Link
          </CardTitle>
          {referredCount > 0 && (
            <Badge className="gap-1 bg-accent/20 text-accent border border-accent/40">
              <Star className="h-3 w-3" />
              {referredCount} Referred
            </Badge>
          )}
        </div>
        <CardDescription>
          Share your link and earn rewards for every user you invite to ICPWorld
          MemePad
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {!displayUrl ? (
          <div className="space-y-4">
            <Alert className="border-accent/30 bg-accent/5">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription>
                Generate your unique referral link to start inviting friends and
                earning rewards.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2 h-12"
              data-ocid="generate-referral-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Generate Referral Link
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Referral URL display */}
            <div className="space-y-2">
              <label
                htmlFor="referral-url-input"
                className="text-sm font-semibold text-muted-foreground flex items-center gap-1"
              >
                <Share2 className="h-3.5 w-3.5" /> Your permanent referral link:
              </label>
              <div className="flex gap-2">
                <Input
                  id="referral-url-input"
                  value={displayUrl}
                  readOnly
                  className="font-mono text-xs bg-muted/30 border-accent/30 text-foreground"
                  data-ocid="referral-link-input"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-accent/50 text-accent hover:bg-accent/10"
                  data-ocid="referral-copy-btn"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-accent/50 text-accent hover:bg-accent/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-accent/20">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Referred:</span>
                <span className="font-bold text-foreground">
                  {referredCount}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Rewards:</span>
                <span className="font-bold text-primary">Active</span>
              </div>
            </div>

            {/* Social share */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Share on social media:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    id: "twitter",
                    icon: SiX,
                    label: "X",
                    color: "hover:bg-foreground/10",
                  },
                  {
                    id: "facebook",
                    icon: SiFacebook,
                    label: "FB",
                    color: "hover:bg-blue-500/10",
                  },
                  {
                    id: "telegram",
                    icon: SiTelegram,
                    label: "TG",
                    color: "hover:bg-sky-500/10",
                  },
                  {
                    id: "whatsapp",
                    icon: SiWhatsapp,
                    label: "WA",
                    color: "hover:bg-green-500/10",
                  },
                ].map(({ id, icon: Icon, label, color }) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare(id)}
                    className={`gap-2 border-accent/30 text-foreground ${color}`}
                    data-ocid={`share-${id}-btn`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full gap-2 text-muted-foreground hover:text-foreground text-xs"
            >
              <RefreshCw
                className={`h-3 w-3 ${generating ? "animate-spin" : ""}`}
              />
              Refresh referral link
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
