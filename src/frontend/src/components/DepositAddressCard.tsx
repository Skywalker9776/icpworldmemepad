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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  QrCode,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface DepositAddressCardProps {
  depositAddress?: string;
  variant?: "default" | "compact";
  isLoading?: boolean;
}

export default function DepositAddressCard({
  depositAddress: propAddress,
  variant = "default",
  isLoading: propLoading = false,
}: DepositAddressCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [localAddress, setLocalAddress] = useState<string>(propAddress || "");
  const [generating, setGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Auto-fetch deposit address from actor on mount / on actor ready
  useEffect(() => {
    if (!actor || actorFetching) return;
    if (localAddress && localAddress.length === 64) return;

    const fetchAddress = async () => {
      setGenerating(true);
      try {
        const address = await actor.getDepositAddress();
        if (
          address &&
          address.length === 64 &&
          /^[0-9a-f]{64}$/i.test(address)
        ) {
          setLocalAddress(address);
          queryClient.setQueryData(["depositAddress"], address);
        }
      } catch (err) {
        console.error("Failed to fetch deposit address:", err);
      } finally {
        setGenerating(false);
      }
    };

    fetchAddress();
  }, [actor, actorFetching, localAddress, queryClient]);

  // Sync with prop changes
  useEffect(() => {
    if (
      propAddress &&
      propAddress.length === 64 &&
      /^[0-9a-f]{64}$/i.test(propAddress)
    ) {
      setLocalAddress(propAddress);
    }
  }, [propAddress]);

  const handleRetry = async () => {
    if (!actor) return;
    setRetryCount((c) => c + 1);
    setGenerating(true);
    try {
      const address = await actor.getDepositAddress();
      if (address && address.length === 64) {
        setLocalAddress(address);
        queryClient.invalidateQueries({ queryKey: ["depositAddress"] });
        toast.success("Deposit address generated successfully!");
      }
    } catch {
      toast.error("Could not generate address. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (displayAddress && displayAddress.length === 64) {
      navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      toast.success("Deposit address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRCodeURL = (address: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(address)}`;

  const displayAddress = localAddress || propAddress || "";
  const isValidAddress =
    displayAddress.length === 64 && /^[0-9a-f]{64}$/i.test(displayAddress);
  const isLoading = propLoading || generating || actorFetching;

  if (variant === "compact") {
    return (
      <div className="space-y-3" data-ocid="deposit-address-compact">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Your ICP Deposit Address
          </span>
          {isValidAddress ? (
            <Badge className="gap-1 bg-primary/20 text-primary border border-primary/40">
              <CheckCircle2 className="h-3 w-3" /> Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-yellow-600 text-yellow-400"
            >
              <Loader2 className="h-3 w-3 animate-spin" /> Generating
            </Badge>
          )}
        </div>

        <div className="bg-black border-2 border-primary/50 rounded-lg p-4 min-h-[70px] flex items-center justify-center">
          {isLoading || !isValidAddress ? (
            <div className="flex items-center gap-3 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">
                Generating your unique ICP deposit address...
              </span>
            </div>
          ) : (
            <p className="font-mono text-sm font-bold text-primary break-all text-center tracking-wide">
              {displayAddress}
            </p>
          )}
        </div>

        {isValidAddress && (
          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowQR(true)}
              variant="outline"
              size="sm"
              className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
            >
              <QrCode className="h-4 w-4" /> QR Code
            </Button>
          </div>
        )}

        {!isLoading && !isValidAddress && (
          <div className="flex gap-2 items-center">
            <Alert className="border-yellow-600/50 bg-yellow-600/10 flex-1">
              <Info className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs text-yellow-200">
                Your unique ICP deposit address is being generated from your
                Principal ID.
              </AlertDescription>
            </Alert>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={generating}
              className="border-yellow-600 text-yellow-400 shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        )}

        <QRDialog
          open={showQR}
          onClose={() => setShowQR(false)}
          address={displayAddress}
          onCopy={handleCopy}
          copied={copied}
          qrUrl={generateQRCodeURL(displayAddress)}
        />
      </div>
    );
  }

  return (
    <Card
      className="border-4 border-primary/40 bg-gradient-to-br from-black via-card to-black shadow-lg"
      data-ocid="deposit-address-card"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary text-2xl">
            <Wallet className="h-7 w-7" />
            Your ICP Deposit Address
          </CardTitle>
          {isValidAddress && (
            <Badge className="gap-1 bg-primary/20 text-primary border border-primary/40">
              <CheckCircle2 className="h-3 w-3" /> Live
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground">
          Send ICP from any exchange or external wallet to this unique
          64-character hex address
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-foreground/80">
            This is your unique ICP Ledger deposit address derived from your
            Principal ID using SHA-224 + CRC32 (canonical ICP Ledger
            AccountIdentifier format). It's compatible with all exchanges and
            ICP wallets.
          </AlertDescription>
        </Alert>

        {/* Address Display Box */}
        <div className="relative">
          <div className="bg-black border-4 border-primary/60 rounded-xl p-6 min-h-[110px] flex items-center justify-center shadow-inner">
            {isLoading || !isValidAddress ? (
              <div className="flex flex-col items-center gap-3 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm text-center text-muted-foreground">
                  Generating your unique 64-character ICP deposit address...
                </span>
                {retryCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Attempt {retryCount + 1}...
                  </span>
                )}
              </div>
            ) : (
              <p className="font-mono text-base font-bold text-primary break-all text-center tracking-wide leading-relaxed">
                {displayAddress}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isValidAddress ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCopy}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/80 font-bold h-12"
              data-ocid="deposit-copy-btn"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Address
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowQR(true)}
              variant="outline"
              className="gap-2 border-2 border-primary text-primary hover:bg-primary/10 font-bold h-12"
            >
              <QrCode className="h-5 w-5" /> Show QR Code
            </Button>
          </div>
        ) : (
          !isLoading && (
            <div className="space-y-3">
              <Alert className="border-yellow-600/50 bg-yellow-600/10">
                <Info className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm text-yellow-200">
                  Your deposit address is being generated. This happens
                  automatically when you complete your profile setup. If it
                  doesn't appear, click Retry below.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleRetry}
                disabled={generating}
                variant="outline"
                className="w-full gap-2 border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                data-ocid="deposit-retry-btn"
              >
                <RefreshCw
                  className={`h-4 w-4 ${generating ? "animate-spin" : ""}`}
                />
                {generating ? "Generating..." : "Retry — Generate Address"}
              </Button>
            </div>
          )
        )}

        <QRDialog
          open={showQR}
          onClose={() => setShowQR(false)}
          address={displayAddress}
          onCopy={handleCopy}
          copied={copied}
          qrUrl={generateQRCodeURL(displayAddress)}
        />
      </CardContent>
    </Card>
  );
}

function QRDialog({
  open,
  onClose,
  address,
  onCopy,
  copied,
  qrUrl,
}: {
  open: boolean;
  onClose: () => void;
  address: string;
  onCopy: () => void;
  copied: boolean;
  qrUrl: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black border-4 border-primary/60">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <QrCode className="h-5 w-5" /> Scan to Deposit ICP
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-white rounded-xl">
            <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
          </div>
          <div className="bg-black border-2 border-primary/50 rounded-lg p-3">
            <p className="font-mono text-xs font-bold text-primary break-all text-center tracking-wide">
              {address}
            </p>
          </div>
          <Alert className="border-primary/30 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-foreground/80">
              Scan with your ICP wallet app to send funds to your
              ICPWorldMemepad wallet
            </AlertDescription>
          </Alert>
          <Button
            onClick={onCopy}
            className="w-full gap-2 bg-primary text-primary-foreground font-bold"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Address
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
