import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  QrCode,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useWithdrawICP } from "../hooks/useQueries";

interface DepositWithdrawDialogProps {
  type?: "icp" | "memecoin";
  trigger: React.ReactNode;
  initialTab?: "deposit" | "withdraw";
  depositAddress?: string;
}

export default function DepositWithdrawDialog({
  type = "icp",
  trigger,
  initialTab = "deposit",
  depositAddress: propDepositAddress,
}: DepositWithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">(
    initialTab,
  );
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [localDepositAddress, setLocalDepositAddress] = useState(
    propDepositAddress || "",
  );
  const [loadingAddress, setLoadingAddress] = useState(false);
  const withdrawICP = useWithdrawICP();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !localDepositAddress && actor) {
      setLoadingAddress(true);
      try {
        const address = await actor.getDepositAddress();
        if (address && address.length === 64) {
          setLocalDepositAddress(address);
          queryClient.setQueryData(["depositAddress"], address);
        }
      } catch (err) {
        console.error("Failed to load deposit address:", err);
      } finally {
        setLoadingAddress(false);
      }
    }
  };

  const displayAddress = localDepositAddress || propDepositAddress || "";
  const isValidAddress =
    displayAddress.length === 64 && /^[0-9a-f]{64}$/i.test(displayAddress);

  const handleCopyDeposit = async () => {
    if (!displayAddress) return;
    await navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    toast.success("Deposit address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const validateHexAddress = (address: string) =>
    address.length === 64 && /^[0-9a-fA-F]{64}$/.test(address);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid withdrawal amount greater than zero");
      return;
    }
    if (!destinationAddress.trim()) {
      toast.error("Enter a destination address");
      return;
    }
    if (!validateHexAddress(destinationAddress.trim())) {
      toast.error(
        "Invalid destination address — must be a 64-character hex string",
      );
      return;
    }
    const amountInE8s = BigInt(Math.floor(amountNum * 100_000_000));
    try {
      await withdrawICP.mutateAsync({
        amount: amountInE8s,
        destinationAddress: destinationAddress.trim().toLowerCase(),
      });
      setOpen(false);
      setAmount("");
      setDestinationAddress("");
    } catch (err) {
      console.error("Withdrawal error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-2 border-primary/40">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            {type === "icp"
              ? "ICP Wallet — Deposit & Withdraw"
              : "Memecoin Transactions"}
          </DialogTitle>
          <DialogDescription>
            {type === "icp"
              ? "Deposit ICP from external wallets or withdraw to any address"
              : "Manage your memecoin transactions"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "deposit" | "withdraw")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" data-ocid="deposit-tab">
              <ArrowDownToLine className="h-4 w-4 mr-2" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" data-ocid="withdraw-tab">
              <ArrowUpFromLine className="h-4 w-4 mr-2" /> Withdraw
            </TabsTrigger>
          </TabsList>

          {/* DEPOSIT TAB */}
          <TabsContent value="deposit" className="space-y-4 mt-4">
            <Alert className="border-primary/30 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Send ICP from any exchange or wallet to your unique deposit
                address below. Funds appear after blockchain confirmation
                (usually ~1 min).
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">
                Your ICP Deposit Address (64-char hex)
              </Label>
              <div className="bg-black border-2 border-primary/50 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                {loadingAddress ? (
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">
                      Loading your deposit address...
                    </span>
                  </div>
                ) : isValidAddress ? (
                  <p className="font-mono text-sm font-bold text-primary break-all text-center tracking-wide">
                    {displayAddress}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">
                      Generating your deposit address...
                    </span>
                  </div>
                )}
              </div>

              {isValidAddress && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyDeposit}
                    variant="outline"
                    className="flex-1 gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold"
                    data-ocid="dialog-copy-deposit-btn"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Address
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/50 text-primary hover:bg-primary/10"
                    onClick={() => {
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(displayAddress)}`;
                      window.open(qrUrl, "_blank");
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-primary/20 space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">How to deposit:</p>
              <p>1. Copy your unique ICP deposit address above</p>
              <p>2. Open your exchange or external ICP wallet</p>
              <p>3. Send ICP to this address</p>
              <p>4. Balance updates automatically after confirmation</p>
            </div>
          </TabsContent>

          {/* WITHDRAW TAB */}
          <TabsContent value="withdraw" className="mt-4">
            {type === "icp" ? (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <Alert className="border-primary/30 bg-primary/5">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    Withdraw ICP to any external wallet or exchange. Minimum fee
                    applies.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label
                    htmlFor="withdraw-amount"
                    className="text-sm font-semibold"
                  >
                    Amount (ICP)
                  </Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0.0000"
                    step="0.0001"
                    min="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={withdrawICP.isPending}
                    required
                    className="bg-input border-primary/30 text-foreground"
                    data-ocid="withdraw-amount-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="withdraw-addr"
                    className="text-sm font-semibold"
                  >
                    Destination Address (64-char hex)
                  </Label>
                  <Input
                    id="withdraw-addr"
                    type="text"
                    placeholder="Enter 64-character ICP Ledger address"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    disabled={withdrawICP.isPending}
                    className="font-mono text-sm bg-input border-primary/30"
                    data-ocid="withdraw-address-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Compatible with all ICP wallets and exchanges
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={withdrawICP.isPending}
                    className="flex-1 gap-2 h-11"
                    data-ocid="withdraw-submit-btn"
                  >
                    {withdrawICP.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowUpFromLine className="h-4 w-4" />
                        Confirm Withdrawal
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={withdrawICP.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center text-muted-foreground space-y-3">
                <ArrowUpFromLine className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p>
                  Memecoin withdrawal functionality is available through the
                  Trading page.
                </p>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
