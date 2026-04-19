import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ExternalBlob,
  FeeRecord,
  LiquidityLock,
  Memecoin,
  OwnershipRecord,
  Referral,
  TradingTransaction,
  Transaction,
  UserProfile,
  Wallet,
} from "../backend";
import { useActor } from "./useActor";

// ─── User Profile ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["ownershipRecords"] });
      queryClient.invalidateQueries({ queryKey: ["referralStats"] });
      toast.success(
        "Profile saved! Your wallet with unique 64-character ICP deposit address has been created.",
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// ─── Wallet ─────────────────────────────────────────────────────────────────

export function useGetCallerWallet() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Wallet | null>({
    queryKey: ["callerWallet"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerWallet();
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 10000,
    staleTime: 0,
  });
}

/**
 * getDepositAddress is a shared update function (not a query).
 * We expose it as a mutation and auto-invoke it when the actor is ready.
 */
export function useGetDepositAddress() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Cached value from previous successful call
  const cachedQuery = useQuery<string>({
    queryKey: ["depositAddress"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const address = await actor.getDepositAddress();
      if (!address || address.length !== 64) {
        throw new Error("Invalid deposit address format received from backend");
      }
      return address;
    },
    enabled: !!actor && !actorFetching,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 12000),
    staleTime: 0,
    refetchInterval: false,
  });

  const mutation = useMutation<string, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const address = await actor.getDepositAddress();
      if (!address || address.length !== 64) {
        throw new Error("Invalid deposit address format received from backend");
      }
      return address;
    },
    onSuccess: (address) => {
      queryClient.setQueryData(["depositAddress"], address);
    },
    onError: (error) => {
      console.error("Failed to generate deposit address:", error);
    },
  });

  const depositAddressValue =
    cachedQuery.data ?? (mutation.data as string | undefined);
  const isLoading =
    (!depositAddressValue && (actorFetching || cachedQuery.isLoading)) ||
    mutation.isPending;

  return {
    depositAddress: depositAddressValue ?? "",
    /** Alias for depositAddress — backward compat with pages that destructure { data } */
    data: depositAddressValue ?? "",
    isLoading,
    isError: cachedQuery.isError && mutation.isError,
    error: cachedQuery.error ?? mutation.error,
    refetch: () => {
      mutation.mutate();
    },
    mutation,
    query: cachedQuery,
  };
}

// ─── Transaction History ───────────────────────────────────────────────────

export function useGetTransactionHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ["transactionHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !actorFetching,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useWithdrawICP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      destinationAddress,
    }: {
      amount: bigint;
      destinationAddress: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.withdrawICP(amount, destinationAddress);
    },
    onSuccess: (transactionId) => {
      queryClient.invalidateQueries({ queryKey: ["callerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
      toast.success(`Withdrawal initiated! Transaction ID: ${transactionId}`);
    },
    onError: (error: Error) => {
      const msg = error.message || "Unknown error";
      if (msg.includes("Insufficient balance"))
        toast.error("Insufficient balance for withdrawal");
      else if (msg.includes("Destination address"))
        toast.error("Invalid destination address");
      else if (msg.includes("amount must be greater than zero"))
        toast.error("Withdrawal amount must be greater than zero");
      else toast.error(`Withdrawal failed: ${msg}`);
    },
  });
}

// ─── Memecoins ──────────────────────────────────────────────────────────────

export function useGetMemecoins() {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["memecoins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMemecoins();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetHotMemecoins() {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["hotMemecoins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHotMemecoins();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetTrendingMemecoins() {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["trendingMemecoins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingMemecoins();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetNewMemecoins() {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["newMemecoins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNewMemecoins();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetProgressingMemecoins() {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["progressingMemecoins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProgressingMemecoins();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetMemecoinsbyCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Memecoin[]>({
    queryKey: ["memecoinsbyCategory", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMemecoinsbyCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    refetchInterval: 15000,
    staleTime: 5000,
  });
}

export function useGetAvailableCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["availableCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableCategories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

export function useCreateMemecoin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      symbol,
      description,
      totalSupply,
      logo,
      lockDuration,
      category,
    }: {
      name: string;
      symbol: string;
      description: string;
      totalSupply: bigint;
      logo: ExternalBlob;
      lockDuration: bigint;
      category: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMemecoin(
        name,
        symbol,
        description,
        totalSupply,
        logo,
        lockDuration,
        category,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memecoins"] });
      queryClient.invalidateQueries({ queryKey: ["hotMemecoins"] });
      queryClient.invalidateQueries({ queryKey: ["trendingMemecoins"] });
      queryClient.invalidateQueries({ queryKey: ["newMemecoins"] });
      queryClient.invalidateQueries({ queryKey: ["progressingMemecoins"] });
      queryClient.invalidateQueries({ queryKey: ["liquidityLocks"] });
      queryClient.invalidateQueries({ queryKey: ["ownershipRecords"] });
      queryClient.invalidateQueries({ queryKey: ["callerWallet"] });
      toast.success(
        "🚀 Memecoin created! 20% liquidity locked. Live on ICP blockchain!",
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to create memecoin: ${error.message}`);
    },
  });
}

// ─── Trading ────────────────────────────────────────────────────────────────

export function useGetTradingTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<TradingTransaction[]>({
    queryKey: ["tradingTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTradingTransactions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useGetTradingFeeRate() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["tradingFeeRate"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTradingFeeRate();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Referrals ──────────────────────────────────────────────────────────────

export function useGenerateReferralLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const code = await actor.generateReferralLink();
      if (!code || code.length === 0)
        throw new Error("Invalid referral code received");
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referralStats"] });
      toast.success("🎉 Referral link generated! Share it to earn rewards.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to generate referral link: ${error.message}`);
    },
  });
}

export function useGetReferralStats() {
  const { actor, isFetching } = useActor();

  return useQuery<Referral | null>({
    queryKey: ["referralStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReferralStats();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 15000,
    staleTime: 0,
  });
}

export function useGetReferralCode() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["referralCode"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getReferralCode();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

export function useTrackReferral() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.trackReferral(code);
    },
  });
}

// ─── Liquidity & Ownership ──────────────────────────────────────────────────

export function useGetLiquidityLocks() {
  const { actor, isFetching } = useActor();

  return useQuery<LiquidityLock[]>({
    queryKey: ["liquidityLocks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLiquidityLocks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOwnershipRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<OwnershipRecord[]>({
    queryKey: ["ownershipRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnershipRecords();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

// ─── CEO / Admin ─────────────────────────────────────────────────────────────

export function useGetCEO() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["ceo"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getCEO();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCEO() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCEO"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCEO();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 2,
    refetchInterval: 30000,
    staleTime: 20000,
  });
}

export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCurrentUserAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Platform Info ───────────────────────────────────────────────────────────

export function useGetOfficialTwitter() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["officialTwitter"],
    queryFn: async () => {
      if (!actor) return "https://x.com/icpmemeworld";
      return actor.getOfficialTwitter();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetOfficialTelegram() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["officialTelegram"],
    queryFn: async () => {
      if (!actor) return "https://t.me/icpworldmemepad";
      return actor.getOfficialTelegram();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetOfficialDepositAddresses() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["officialDepositAddresses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOfficialDepositAddresses();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetWalletConnectionOptions() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, boolean]>>({
    queryKey: ["walletConnectionOptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWalletConnectionOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActorId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["actorId"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getActorId();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetFeeRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<FeeRecord[]>({
    queryKey: ["feeRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeeRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  type Principal = import("../backend").Wallet["owner"];

  return useMutation({
    mutationFn: async ({
      memecoin,
      buyer,
      amount,
      price,
    }: {
      memecoin: string;
      buyer: Principal;
      amount: bigint;
      price: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveTrade(memecoin, buyer, amount, price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingTransactions"] });
      toast.success("Trade approved!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve trade: ${error.message}`);
    },
  });
}

export function useTradeMemecoin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  type Principal = import("../backend").Wallet["owner"];

  return useMutation({
    mutationFn: async ({
      memecoin,
      amount,
      price,
      seller,
    }: {
      memecoin: string;
      amount: bigint;
      price: bigint;
      seller: Principal;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.tradeMemecoin(memecoin, amount, price, seller);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tradingTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["callerWallet"] });
      queryClient.invalidateQueries({ queryKey: ["ownershipRecords"] });
      toast.success("🔥 Trade executed successfully!");
    },
    onError: (error: Error) => {
      toast.error(`Trade failed: ${error.message}`);
    },
  });
}

// ─── Icpswap Wallet ──────────────────────────────────────────────────────────

export function useGetIcpswapWalletAddress() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["icpswapWalletAddress"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getIcpswapWalletAddress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetIcpswapWalletBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ["icpswapWalletBalance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getIcpswapWalletBalance();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useGetIcpswapWalletConnectionStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["icpswapWalletConnectionStatus"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getIcpswapWalletConnectionStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}
