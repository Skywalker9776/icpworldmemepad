import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Crown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionStatus, TransactionType } from "../backend";
import type { OwnershipRecord, Transaction } from "../backend";
import DepositAddressCard from "../components/DepositAddressCard";
import DepositWithdrawDialog from "../components/DepositWithdrawDialog";
import ReferralShareCard from "../components/ReferralShareCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerWallet,
  useGetDepositAddress,
  useGetMemecoins,
  useGetOwnershipRecords,
  useGetTransactionHistory,
  useIsCEO,
} from "../hooks/useQueries";

const ICP_USD_RATE = 12.5;

function WalletSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.transactionType === TransactionType.deposit;
  const statusColor =
    tx.status === TransactionStatus.confirmed
      ? "text-green-400"
      : tx.status === TransactionStatus.pending
        ? "text-yellow-400"
        : "text-red-400";
  const date = new Date(Number(tx.timestamp) / 1_000_000);
  const amount = (Number(tx.amount) / 100_000_000).toFixed(4);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-full ${isDeposit ? "bg-primary/10" : "bg-secondary/10"}`}
        >
          {isDeposit ? (
            <ArrowDownToLine className="h-4 w-4 text-primary" />
          ) : (
            <ArrowUpFromLine className="h-4 w-4 text-secondary" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold capitalize">
            {tx.transactionType}
          </p>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleString()}
          </p>
          {tx.id && (
            <p className="text-xs font-mono text-muted-foreground/70 truncate max-w-[150px]">
              #{tx.id.slice(0, 12)}...
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-bold ${isDeposit ? "text-green-400" : "text-red-400"}`}
        >
          {isDeposit ? "+" : "-"}
          {amount} ICP
        </p>
        <p className={`text-xs font-medium ${statusColor}`}>{tx.status}</p>
      </div>
    </div>
  );
}

function HoldingCard({
  record,
  memecoinName,
}: { record: OwnershipRecord; memecoinName: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-card to-card/60 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-full bg-primary/10">
          <Coins className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground">{memecoinName}</p>
          <p className="text-xs font-mono text-muted-foreground">
            ${record.memecoin}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-foreground">
          {record.amount.toLocaleString()}
        </p>
        <Badge variant="secondary" className="text-xs mt-0.5">
          {record.percentage.toString()}% ownership
        </Badge>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { identity } = useInternetIdentity();
  const { data: wallet, isLoading: walletLoading } = useGetCallerWallet();
  const { data: depositAddress = "", isLoading: depositAddressLoading } =
    useGetDepositAddress();
  const { data: ownershipRecords = [], isLoading: ownershipLoading } =
    useGetOwnershipRecords();
  const { data: memecoins = [] } = useGetMemecoins();
  const { data: transactions = [], isLoading: txLoading } =
    useGetTransactionHistory();
  const { data: isCEO } = useIsCEO();
  const [txFilter, setTxFilter] = useState<"all" | "deposit" | "withdrawal">(
    "all",
  );
  const [txPage, setTxPage] = useState(1);
  const TX_PER_PAGE = 10;

  if (!identity) {
    return (
      <div
        className="container py-16 max-w-lg mx-auto"
        data-ocid="portfolio-unauthenticated"
      >
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-8 text-center pb-8 space-y-4">
            <div className="p-4 rounded-full bg-primary/10 inline-block">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Login to View Portfolio</h2>
            <p className="text-muted-foreground">
              Connect your wallet to see your ICP balance, holdings, and
              referral link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const icpBalance = wallet ? Number(wallet.balance) / 100_000_000 : 0;
  const icpUSD = (icpBalance * ICP_USD_RATE).toFixed(2);

  const getMemecoinName = (symbol: string) => {
    const coin = memecoins.find((c) => c.symbol === symbol);
    return coin ? coin.name : symbol;
  };

  const filteredTx = transactions.filter((tx) => {
    if (txFilter === "all") return true;
    return tx.transactionType === txFilter;
  });
  const totalTxPages = Math.max(1, Math.ceil(filteredTx.length / TX_PER_PAGE));
  const pagedTx = filteredTx.slice(
    (txPage - 1) * TX_PER_PAGE,
    txPage * TX_PER_PAGE,
  );

  return (
    <div
      className="container py-8 max-w-5xl mx-auto space-y-8"
      data-ocid="portfolio-page"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-foreground">My Portfolio</h1>
          {isCEO && (
            <Badge
              className="gap-1.5 bg-primary/20 text-primary border border-primary/40 px-3 py-1 text-sm"
              data-ocid="ceo-badge"
            >
              <Crown className="h-4 w-4" />
              🎖️ CEO — Akmal Bhutta — Lifetime Free Access
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Manage your ICP balance, deposits, withdrawals, and memecoin holdings
        </p>
      </div>

      {walletLoading ? (
        <WalletSkeleton />
      ) : (
        <>
          {/* Wallet Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                  ICP Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-foreground">
                    {icpBalance.toFixed(4)}
                  </span>
                  <span className="text-2xl font-semibold text-primary mb-1">
                    ICP
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  ≈ ${icpUSD} USD
                </p>
                <div className="flex gap-3 mt-4">
                  <DepositWithdrawDialog
                    type="icp"
                    initialTab="deposit"
                    depositAddress={depositAddress}
                    trigger={
                      <Button
                        className="flex-1 gap-2 h-10 font-bold"
                        data-ocid="deposit-btn"
                      >
                        <ArrowDownToLine className="h-4 w-4" /> Deposit ICP
                      </Button>
                    }
                  />
                  <DepositWithdrawDialog
                    type="icp"
                    initialTab="withdraw"
                    depositAddress={depositAddress}
                    trigger={
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 h-10 border-primary text-primary hover:bg-primary/10 font-bold"
                        data-ocid="withdraw-btn"
                      >
                        <ArrowUpFromLine className="h-4 w-4" /> Withdraw
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Holdings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {ownershipRecords.length}
                  </span>
                  <span className="text-lg text-muted-foreground mb-1">
                    tokens
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Total memecoin positions
                </p>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Transactions</span>
                    <span className="font-bold text-foreground">
                      {transactions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Account Status</span>
                    <Badge className="text-xs h-5 bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit Address Card */}
          <DepositAddressCard
            depositAddress={depositAddress}
            isLoading={depositAddressLoading}
          />

          {/* Referral Link */}
          <ReferralShareCard />

          {/* Transaction History */}
          <Card
            className="border-2 border-primary/20"
            data-ocid="transaction-history"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Transaction History
                </CardTitle>
                <div className="flex gap-1.5">
                  {(["all", "deposit", "withdrawal"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={txFilter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTxFilter(f);
                        setTxPage(1);
                      }}
                      className="h-7 text-xs capitalize"
                      data-ocid={`tx-filter-${f}`}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : pagedTx.length > 0 ? (
                <div className="space-y-2">
                  {pagedTx.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                  {totalTxPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={txPage === 1}
                        onClick={() => setTxPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {txPage} / {totalTxPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={txPage === totalTxPages}
                        onClick={() => setTxPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="text-center py-10 space-y-3"
                  data-ocid="tx-empty-state"
                >
                  <Clock className="h-14 w-14 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground/70">
                    Deposit ICP to see your transaction history
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memecoin Holdings */}
          <Card
            className="border-2 border-accent/20"
            data-ocid="memecoin-holdings"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Memecoin Holdings
              </CardTitle>
              <CardDescription>
                Your memecoin ownership records across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownershipLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : ownershipRecords.length > 0 ? (
                <div className="space-y-3">
                  {ownershipRecords.map((record) => (
                    <HoldingCard
                      key={`${record.memecoin}-${record.owner.toString()}`}
                      record={record}
                      memecoinName={getMemecoinName(record.memecoin)}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-10 space-y-3"
                  data-ocid="holdings-empty-state"
                >
                  <Coins className="h-14 w-14 text-muted-foreground/30 mx-auto" />
                  <p className="text-muted-foreground">
                    No memecoin holdings yet
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Create or trade memecoins to build your portfolio
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => {
                      window.location.href = "/create";
                    }}
                  >
                    Create a Memecoin
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
