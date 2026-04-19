import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Component, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ProfileSetupModal from "./components/ProfileSetupModal";
import WalletCreatedNotification from "./components/WalletCreatedNotification";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "./hooks/useQueries";
import AIFeaturesPage from "./pages/AIFeaturesPage";
import AboutPage from "./pages/AboutPage";
import CreateMemecoinPage from "./pages/CreateMemecoinPage";
import DesignBlueprintPage from "./pages/DesignBlueprintPage";
import HomePage from "./pages/HomePage";
import LiquidityPoolPage from "./pages/LiquidityPoolPage";
import OfficialWebsitePage from "./pages/OfficialWebsitePage";
import PortfolioPage from "./pages/PortfolioPage";
import SettingsPage from "./pages/SettingsPage";
import SwapPage from "./pages/SwapPage";
import TradingPage from "./pages/TradingPage";

// Error Boundary Component
class ErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: ReactNode;
    fallback?: (error: Error, reset: () => void) => ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, () => {
          this.setState({ hasError: false, error: null });
        });
      }
      return (
        <ErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-red-950/20 to-black p-4">
      <Alert className="max-w-2xl border-4 border-red-500 bg-gradient-to-br from-black to-red-500/10 shadow-2xl">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <AlertDescription className="space-y-6 ml-4">
          <div>
            <p className="font-bold text-2xl text-red-500 mb-2">
              Application Error
            </p>
            <p className="text-white text-lg">
              {error.message || "An unexpected error occurred"}
            </p>
            {error.stack && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-40 p-2 bg-black/50 rounded">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
            {reset && (
              <button
                type="button"
                onClick={reset}
                className="px-6 py-3 bg-quantum-gold hover:bg-quantum-gold/80 text-black font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: AppLayout,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateMemecoinPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const tradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trading",
  component: TradingPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portfolio",
  component: PortfolioPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const websiteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/website",
  component: OfficialWebsitePage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const liquidityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/liquidity",
  component: LiquidityPoolPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const swapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/swap",
  component: SwapPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const aiFeaturesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-features",
  component: AIFeaturesPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const designBlueprintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-blueprint",
  component: DesignBlueprintPage,
  errorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createRoute_,
  tradingRoute,
  portfolioRoute,
  aboutRoute,
  websiteRoute,
  liquidityRoute,
  swapRoute,
  settingsRoute,
  aiFeaturesRoute,
  designBlueprintRoute,
]);

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error, reset }: ErrorComponentProps) => (
    <ErrorFallback error={error} reset={reset} />
  ),
  defaultPreload: "intent",
  defaultPendingComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 border-4 border-quantum-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-2xl text-quantum-gold font-bold animate-pulse flex items-center gap-2 justify-center">
          <Sparkles className="h-6 w-6" />
          AI-Enhanced Loading...
        </p>
      </div>
    </div>
  ),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showWalletNotification, setShowWalletNotification] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const isInitializing = loginStatus === "logging-in";

  useEffect(() => {
    if (saveProfile.isSuccess) {
      setShowWalletNotification(true);
    }
  }, [saveProfile.isSuccess]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 border-4 border-quantum-gold border-t-transparent rounded-full animate-spin mx-auto shadow-quantum-gold" />
          <p className="text-3xl text-quantum-gold font-bold animate-pulse flex items-center gap-3 justify-center">
            <Sparkles className="h-8 w-8" />
            Initializing Icpworldmemepad...
          </p>
          <p className="text-gray-400">
            Connecting to Internet Computer Protocol
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
      {showProfileSetup && (
        <ProfileSetupModal
          onComplete={() => {
            // Profile setup complete
          }}
        />
      )}
      {showWalletNotification && (
        <WalletCreatedNotification
          onClose={() => setShowWalletNotification(false)}
        />
      )}
      <PWAInstallPrompt />
    </>
  );
}

export default function App() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);

    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setError(event.error || new Error("Unknown error occurred"));
      setHasError(true);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      const errorMessage =
        (event.reason as { message?: string })?.message ??
        event.reason ??
        "Unhandled promise rejection";
      setError(new Error(String(errorMessage)));
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  if (hasError && error) {
    return (
      <ErrorFallback
        error={error}
        reset={() => {
          setHasError(false);
          setError(null);
          window.location.reload();
        }}
      />
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-quantum-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-2xl text-quantum-gold font-bold animate-pulse flex items-center gap-2 justify-center">
            <Sparkles className="h-6 w-6" />
            Loading Icpworldmemepad...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        forcedTheme="dark"
      >
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
