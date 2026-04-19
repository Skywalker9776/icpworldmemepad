import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Sparkles, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({
  onComplete,
}: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"welcome" | "form">("welcome");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      saveProfile.mutate(
        {
          name: name.trim(),
          email: email.trim(),
          createdAt: BigInt(Date.now() * 1000000),
        },
        {
          onSuccess: () => {
            onComplete();
          },
        },
      );
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {step === "welcome" ? (
          <div className="space-y-6">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 animate-pulse">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Welcome to Icpworldmemepad! 🎉
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                Let's get you set up with everything you need to create and
                trade memecoins
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      Automatic Wallet Creation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We'll automatically create a secure wallet for you to
                      manage your memecoins and ICP tokens
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground">
                      Your wallet is protected by Internet Identity
                      authentication - no passwords needed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ready to Trade</h3>
                    <p className="text-sm text-muted-foreground">
                      Start creating and trading memecoins immediately after
                      setup
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => setStep("form")}
              className="w-full"
              size="lg"
            >
              Continue to Setup
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Complete Your Profile
              </DialogTitle>
              <DialogDescription>
                Just a few details to personalize your experience
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={saveProfile.isPending}
              >
                {saveProfile.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Your Wallet...
                  </>
                ) : (
                  "Complete Setup & Create Wallet"
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
