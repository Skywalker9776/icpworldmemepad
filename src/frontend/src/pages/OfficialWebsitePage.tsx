import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ExternalLink,
  Globe,
  Maximize2,
  RefreshCw,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { SiTelegram } from "react-icons/si";

const OFFICIAL_URL = "https://icpmemeworld-65u.caffeine.xyz";

export default function OfficialWebsitePage() {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-black via-purple-950/20 to-black border-b border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Official Website
              </h1>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                ● LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              The official ICPWorldMemepad platform — the world's first
              AI-powered quantum memepad on ICP Blockchain.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="open-website-btn"
            >
              <Button className="bg-primary text-primary-foreground font-bold gap-2">
                <ExternalLink className="h-4 w-4" /> Open in New Tab
              </Button>
            </a>
            <a
              href="https://x.com/icpmemeworld"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="website-twitter"
            >
              <Button variant="outline" className="gap-2">
                <Twitter className="h-4 w-4" /> @icpmemeworld
              </Button>
            </a>
            <a
              href="https://t.me/icpworldmemepad"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="website-telegram"
            >
              <Button
                variant="outline"
                className="bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 gap-2"
              >
                <SiTelegram className="h-4 w-4" /> Telegram
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* URL bar */}
        <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-mono text-foreground truncate flex-1">
            {OFFICIAL_URL}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setKey((k) => k + 1);
              setFrameLoaded(false);
              setFrameError(false);
            }}
            className="shrink-0 gap-1.5"
            data-ocid="refresh-website-btn"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <a href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5"
              data-ocid="maximize-website-btn"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Full Screen
            </Button>
          </a>
        </div>

        {/* Iframe */}
        <div
          className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl"
          style={{ minHeight: "700px" }}
        >
          {!frameLoaded && !frameError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card z-10">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">
                Loading ICPWorldMemepad...
              </p>
            </div>
          )}
          {frameError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-card z-10 p-8 text-center">
              <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
                <AlertCircle className="h-10 w-10 text-amber-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  Unable to Embed
                </h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  The website cannot be embedded due to browser security
                  policies. Open it directly in a new tab for the full
                  experience.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <a
                  href={OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    className="bg-primary text-primary-foreground font-bold gap-2"
                    data-ocid="error-open-btn"
                  >
                    <ExternalLink className="h-4 w-4" /> Open ICPWorldMemepad
                  </Button>
                </a>
                <Button
                  variant="outline"
                  onClick={() => {
                    setKey((k) => k + 1);
                    setFrameError(false);
                    setFrameLoaded(false);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </div>
            </div>
          )}
          <iframe
            key={key}
            src={OFFICIAL_URL}
            className="w-full"
            style={{
              height: "700px",
              border: "none",
              display: frameError ? "none" : "block",
            }}
            onLoad={() => setFrameLoaded(true)}
            onError={() => setFrameError(true)}
            title="ICPWorldMemepad Official Website"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Platform info cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 border-border bg-card/80 space-y-3 text-center">
            <div className="text-3xl">🌐</div>
            <p className="font-bold text-foreground">Official Platform</p>
            <p className="text-xs text-muted-foreground">
              The primary ICPWorldMemepad deployment — fully live and accessible
              worldwide.
            </p>
            <a
              href={OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="platform-visit-btn"
            >
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ExternalLink className="h-3.5 w-3.5" /> Visit Platform
              </Button>
            </a>
          </Card>
          <Card className="p-5 border-border bg-card/80 space-y-3 text-center">
            <div className="text-3xl">🐦</div>
            <p className="font-bold text-foreground">Twitter / X</p>
            <p className="text-xs text-muted-foreground">
              Follow @icpmemeworld for the latest updates, launches, and
              AI-powered content drops.
            </p>
            <a
              href="https://x.com/icpmemeworld"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="twitter-follow-btn"
            >
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Twitter className="h-3.5 w-3.5" /> Follow @icpmemeworld
              </Button>
            </a>
          </Card>
          <Card className="p-5 border-border bg-card/80 space-y-3 text-center">
            <div className="text-3xl">✈️</div>
            <p className="font-bold text-foreground">Telegram Community</p>
            <p className="text-xs text-muted-foreground">
              Join our Telegram group for real-time discussions, trading
              signals, and community battles.
            </p>
            <a
              href="https://t.me/icpworldmemepad"
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="telegram-join-btn"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 gap-2"
              >
                <SiTelegram className="h-3.5 w-3.5" /> Join Community
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
