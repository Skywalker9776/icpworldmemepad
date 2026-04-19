import { useActor as useCaffeineActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

export interface UseActorReturn {
  actor: backendInterface | null;
  isFetching: boolean;
}

export function useActor(): UseActorReturn {
  const { actor, isFetching } = useCaffeineActor(createActor);
  return {
    actor: actor as backendInterface | null,
    isFetching,
  };
}
