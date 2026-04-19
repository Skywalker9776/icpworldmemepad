import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Globe, Heart } from "lucide-react";
import { SiTelegram, SiX } from "react-icons/si";
import { useGetCEO } from "../hooks/useQueries";

export default function Footer() {
  const { data: ceoText } = useGetCEO();

  return (
    <footer className="border-t-2 border-gold-600 bg-black/95 backdrop-blur">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-gold-300">
            <span>© 2025. Built with</span>
            <Heart className="h-4 w-4 text-gold-600 fill-gold-600" />
            <span>using</span>
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 hover:text-gold-500 hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/website">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-sm text-gold-300 hover:text-gold-400 hover:bg-gold-600/10"
              >
                <Globe className="h-4 w-4" />
                Visit Official Website
              </Button>
            </Link>

            {ceoText && (
              <div className="text-sm font-medium text-gold-300">{ceoText}</div>
            )}

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/icpmemeworld?t=3Bbkhkdt1K5GEbF9hkIYKw&s=08"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gold-300 hover:text-gold-400 transition-colors p-2 rounded-full hover:bg-gold-600/10"
                title="Follow us on X (Twitter)"
              >
                <SiX className="h-5 w-5" />
                <span className="hidden sm:inline">@icpmemeworld</span>
              </a>
              <a
                href="https://t.me/icpworldmemepad"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-gold-300 hover:text-gold-400 transition-colors p-2 rounded-full hover:bg-gold-600/10"
                title="Join our Telegram group"
              >
                <SiTelegram className="h-5 w-5" />
                <span className="hidden sm:inline">Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
