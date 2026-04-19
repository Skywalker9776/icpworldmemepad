import {
  InternetIdentityProvider,
  useInternetIdentity as useCaffeineII,
} from "@caffeineai/core-infrastructure";
import type { Identity } from "@icp-sdk/core/agent";

// Re-export InternetIdentityProvider
export { InternetIdentityProvider };

export type LoginStatus =
  | "anonymous"
  | "logging-in"
  | "logged-in"
  | "error"
  | "initializing";

export interface InternetIdentityContextType {
  identity: Identity | null;
  login: () => Promise<void>;
  clear: () => Promise<void>;
  loginStatus: LoginStatus;
  isInitializing: boolean;
}

/**
 * Thin wrapper around @caffeineai/core-infrastructure's useInternetIdentity
 * with a simplified, consistent interface for the app.
 */
export function useInternetIdentity(): InternetIdentityContextType {
  const ctx = useCaffeineII();

  const identity = ctx.identity ?? null;

  let loginStatus: LoginStatus = "anonymous";
  if (ctx.loginStatus === "initializing") loginStatus = "initializing";
  else if (ctx.loginStatus === "logging-in") loginStatus = "logging-in";
  else if (ctx.loginStatus === "success") loginStatus = "logged-in";
  else if (ctx.loginStatus === "loginError") loginStatus = "error";
  else if (identity) loginStatus = "logged-in";

  return {
    identity,
    login: async () => {
      ctx.login();
    },
    clear: async () => {
      ctx.clear();
    },
    loginStatus,
    isInitializing: ctx.isInitializing,
  };
}
