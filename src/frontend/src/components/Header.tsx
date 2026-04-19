import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownUp,
  Brain,
  Coins,
  Download,
  Droplets,
  Globe,
  Info,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { SiTelegram, SiX } from "react-icons/si";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import LoginOptionsDialog from "./LoginOptionsDialog";

export default function Header() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-quantum-glow bg-quantum-dark/95 backdrop-blur-xl shadow-quantum-yellow">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            aria-label="ICPWorld MemePad Logo"
            className="h-14 w-14 rounded-xl flex items-center justify-center animate-quantum-pulse group-hover:scale-110 transition-transform logo-quantum-glow bg-gradient-to-br from-[#B8860B] via-[#DC143C] to-[#4B0082] shadow-[0_0_24px_rgba(184,134,11,0.7)]"
          >
            <svg
              viewBox="0 0 40 40"
              className="h-9 w-9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
              />
              <text
                x="20"
                y="26"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="900"
                fontSize="13"
                fill="white"
                letterSpacing="-1"
              >
                ICPW
              </text>
              <circle cx="20" cy="9" r="2.5" fill="#FFD700" />
              <circle cx="31" cy="26" r="2" fill="#DC143C" />
              <circle cx="9" cy="26" r="2" fill="#4B0082" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-blazing animate-contract-glow">
              Icpworldmemepad
            </span>
            <Badge className="ai-badge text-[10px] px-2 py-0 text-white font-bold">
              <Sparkles className="h-2.5 w-2.5 mr-1" />
              AI-Enhanced
            </Badge>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Coins className="h-5 w-5" />
              Home
            </Button>
          </Link>
          <Link to="/design-blueprint">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Palette className="h-5 w-5" />
              Design Blueprint
            </Button>
          </Link>
          <Link to="/ai-features">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Brain className="h-5 w-5" />
              AI Features
            </Button>
          </Link>
          <Link to="/create">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Rocket className="h-5 w-5" />
              Create
            </Button>
          </Link>
          <Link to="/trading">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <TrendingUp className="h-5 w-5" />
              Trading
            </Button>
          </Link>
          <Link to="/liquidity">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Droplets className="h-5 w-5" />
              Liquidity
            </Button>
          </Link>
          <Link to="/swap">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <ArrowDownUp className="h-5 w-5" />
              Swap
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Wallet className="h-5 w-5" />
              Portfolio
            </Button>
          </Link>
          <Link to="/about">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Info className="h-5 w-5" />
              About
            </Button>
          </Link>
          <Link to="/website">
            <Button
              variant="ghost"
              className="gap-2 text-quantum-yellow hover:text-quantum-red hover:bg-quantum-yellow/20 font-semibold"
            >
              <Globe className="h-5 w-5" />
              Website
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://x.com/icpmemeworld?t=3Bbkhkdt1K5GEbF9hkIYKw&s=08"
            target="_blank"
            rel="noopener noreferrer"
            className="text-quantum-purple hover:text-quantum-yellow transition-colors"
          >
            <SiX className="h-6 w-6" />
          </a>
          <a
            href="https://t.me/icpworldmemepad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-quantum-purple hover:text-quantum-yellow transition-colors"
          >
            <SiTelegram className="h-6 w-6" />
          </a>

          <Button
            variant="outline"
            className="gap-2 border-2 border-quantum-purple text-quantum-purple hover:bg-quantum-purple/20 font-semibold hidden md:flex"
            size="sm"
          >
            <Download className="h-4 w-4" />
            Download App
          </Button>

          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              className="gap-2 bg-gradient-to-r from-quantum-red to-quantum-purple text-white hover:shadow-quantum-red font-bold text-sm sm:text-base h-10 sm:h-11"
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={() => setShowLoginDialog(true)}
              disabled={isLoggingIn}
              data-ocid="header-login-btn"
              className="gap-2 btn-blazing text-black font-bold hover:shadow-neon-glow text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-6 min-w-[80px] sm:min-w-[100px]"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>{isLoggingIn ? "Loading..." : "Login"}</span>
            </Button>
          )}
        </div>
      </div>

      <LoginOptionsDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </header>
  );
}
