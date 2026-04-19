import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CheckCircle2, Shield, Sparkles, Wallet, X } from "lucide-react";
import { useState } from "react";
import { SiGoogle } from "react-icons/si";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LoginContent({
  onClose,
}: {
  onClose: () => void;
}) {
  const { login, loginStatus } = useInternetIdentity();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const isLoggingIn = loginStatus === "logging-in";

  const handleInternetIdentityLogin = async () => {
    setSelectedMethod("ii");
    try {
      await login();
      toast.success(
        "Connected! Your unique ICP deposit address has been created automatically.",
      );
      onClose();
    } catch {
      toast.error("Failed to connect. Please try again.");
      setSelectedMethod(null);
    }
  };

  const handleIcpswapWalletConnect = async () => {
    setSelectedMethod("icpswap");
    if (typeof window !== "undefined" && (window as any).icpswap) {
      try {
        toast.info("Connecting to Icpswap wallet...");
        const connected = await (window as any).icpswap.connect();
        if (connected) {
          toast.success(
            "Icpswap wallet connected! Your ICP deposit address is now available.",
          );
          onClose();
        } else {
          toast.error("Failed to connect to Icpswap wallet. Please try again.");
        }
      } catch {
        toast.error(
          "Error connecting to Icpswap wallet. Ensure the extension is installed and unlocked.",
        );
      } finally {
        setSelectedMethod(null);
      }
    } else {
      toast.info(
        "Icpswap extension not detected — using Internet Identity fallback.",
      );
      setTimeout(async () => {
        try {
          await login();
          toast.success(
            "Connected via Internet Identity. Your ICP deposit address is ready.",
          );
          onClose();
        } catch {
          toast.error("Failed to connect. Please try again.");
        } finally {
          setSelectedMethod(null);
        }
      }, 800);
    }
  };

  const handleGoogleLogin = async () => {
    setSelectedMethod("google");
    toast.info(
      "Launching Internet Identity — select your Google passkey or passkey account to sign in with Google.",
    );
    try {
      await login();
      toast.success(
        "Connected via Google! Your ICP deposit address has been created automatically.",
      );
      onClose();
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setSelectedMethod(null);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="relative flex flex-col items-center text-center gap-2 pb-5 border-b border-white/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          data-ocid="login-close"
          className="absolute right-0 top-0 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
          <Badge className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs px-3 py-0.5 font-bold border-0">
            AI-Enhanced
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-400 leading-tight">
          Connect to ICPWorldMemepad
        </h2>
        <p className="text-sm sm:text-base text-purple-300 font-medium max-w-xs">
          Choose your login method. Works on all devices — PC, Mac, Android,
          iOS.
        </p>
      </div>

      {/* Login Options */}
      <div className="flex flex-col gap-3 pt-5">
        {/* 1 — Internet Identity */}
        <button
          type="button"
          onClick={handleInternetIdentityLogin}
          disabled={isLoggingIn && selectedMethod === "ii"}
          data-ocid="login-internet-identity"
          aria-label="Login with Internet Identity"
          className="group w-full flex items-center gap-4 rounded-xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-black to-amber-950/40 p-4 text-left transition-all duration-200 hover:border-amber-400 hover:shadow-[0_0_24px_rgba(251,191,36,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <div className="shrink-0 p-3 rounded-full bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.6)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.8)] transition-shadow">
            {isLoggingIn && selectedMethod === "ii" ? (
              <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-amber-300">
                {isLoggingIn && selectedMethod === "ii"
                  ? "Connecting..."
                  : "Login with Internet Identity"}
              </span>
              <Badge className="bg-emerald-600/80 text-white text-xs px-2 py-0 border-0 shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-xs text-amber-200/70 mt-0.5 leading-snug">
              Passwordless, secure — works across all ICP apps
            </p>
          </div>
        </button>

        {/* 2 — Icpswap Wallet */}
        <button
          type="button"
          onClick={handleIcpswapWalletConnect}
          disabled={selectedMethod === "icpswap"}
          data-ocid="login-icpswap"
          aria-label="Connect Icpswap Wallet"
          className="group w-full flex items-center gap-4 rounded-xl border-2 border-red-500/60 bg-gradient-to-r from-red-950/60 via-black to-red-950/40 p-4 text-left transition-all duration-200 hover:border-red-400 hover:shadow-[0_0_24px_rgba(220,38,38,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <div className="shrink-0 p-3 rounded-full bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-[0_0_20px_rgba(220,38,38,0.6)] group-hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-shadow">
            {selectedMethod === "icpswap" ? (
              <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Wallet className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-red-300">
                {selectedMethod === "icpswap"
                  ? "Connecting..."
                  : "Connect Icpswap Wallet"}
              </span>
              <Badge className="bg-emerald-600/80 text-white text-xs px-2 py-0 border-0 shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-xs text-red-200/70 mt-0.5 leading-snug">
              Trade memecoins directly from your Icpswap wallet
            </p>
          </div>
        </button>

        {/* 3 — Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoggingIn && selectedMethod === "google"}
          data-ocid="login-google"
          aria-label="Continue with Google"
          className="group w-full flex items-center gap-4 rounded-xl border-2 border-blue-500/60 bg-gradient-to-r from-blue-950/60 via-black to-blue-950/40 p-4 text-left transition-all duration-200 hover:border-blue-400 hover:shadow-[0_0_24px_rgba(59,130,246,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <div className="shrink-0 p-3 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-shadow">
            {isLoggingIn && selectedMethod === "google" ? (
              <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SiGoogle className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-blue-300">
                {isLoggingIn && selectedMethod === "google"
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>
              <Badge className="bg-emerald-600/80 text-white text-xs px-2 py-0 border-0 shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <p className="text-xs text-blue-200/70 mt-0.5 leading-snug">
              Sign in with your Google account via ICP passkey
            </p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-purple-400/70 mt-4 leading-snug">
        All options generate a unique ICP deposit address automatically. Secure,
        on-chain, no passwords.
      </p>
    </div>
  );
}

export default function LoginOptionsDialog({
  open,
  onOpenChange,
}: LoginOptionsDialogProps) {
  const close = () => onOpenChange(false);

  return (
    <>
      {/* Mobile: bottom sheet anchored to top area, centered */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="sm:hidden rounded-t-2xl border-t-2 border-amber-500/40 bg-[#0a0a0f] p-5 pb-8 max-h-[92svh] overflow-y-auto"
          data-ocid="login-sheet-mobile"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Connect to ICPWorldMemepad</SheetTitle>
            <SheetDescription>Choose your login method</SheetDescription>
          </SheetHeader>
          <LoginContent onClose={close} />
        </SheetContent>
      </Sheet>

      {/* Desktop: centered dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="hidden sm:flex flex-col max-w-md w-full bg-[#0a0a0f] border-2 border-amber-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.15)] top-[10%] translate-y-0"
          data-ocid="login-dialog-desktop"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Connect to ICPWorldMemepad</DialogTitle>
            <DialogDescription>Choose your login method</DialogDescription>
          </DialogHeader>
          <LoginContent onClose={close} />
        </DialogContent>
      </Dialog>
    </>
  );
}
