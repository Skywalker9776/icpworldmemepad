import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletCreatedNotificationProps {
  onClose: () => void;
}

export default function WalletCreatedNotification({
  onClose,
}: WalletCreatedNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card
        className={`max-w-md w-full border-2 border-primary/50 shadow-2xl transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <CardContent className="pt-6 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 animate-pulse">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">
                Wallet Created Successfully! 🎉
              </h3>
              <p className="text-muted-foreground">
                Your secure wallet has been created and is ready to use
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-primary" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">
                    Your wallet is now active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can now create and trade memecoins
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleClose} className="w-full" size="lg">
                Start Exploring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
