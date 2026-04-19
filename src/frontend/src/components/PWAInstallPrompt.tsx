import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Smartphone, X, Zap } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function PWAInstallPrompt() {
  const { isInstallable, promptInstall, dismissPrompt, showPrompt } =
    usePWAInstall();

  if (!isInstallable || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={(open) => !open && dismissPrompt()}>
      <DialogContent className="sm:max-w-md border-2 border-primary/50 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Download className="h-6 w-6 text-primary" />
            Install Icpworldmemepad
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get the best experience with our Progressive Web App
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Native App Experience</p>
              <p className="text-sm text-muted-foreground">
                Install on your device for quick access and app-like experience
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Fast & Reliable</p>
              <p className="text-sm text-muted-foreground">
                Works offline and loads instantly from your home screen
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={promptInstall} className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Install Now
          </Button>
          <Button onClick={dismissPrompt} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
