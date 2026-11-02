# ICPWorld Memepad: deployment and release runbook

Status: preparation only. This document does not authorize deployment, canister upgrades, controller changes, migrations, token creation, or fund movement.

## 1. What CI currently proves

The repository workflow `.github/workflows/frontend-ci.yml` runs:
- `pnpm install --frozen-lockfile`
- frontend TypeScript typecheck
- frontend Vite build
- `mops install --locked`
- `mops check backend` (Motoko type and stable-compatibility checks)
- `mops build backend`

A green run proves these source-level commands passed for that commit. It does not prove that a deployed canister is the same code, that runtime configuration is correct, or that any value-moving feature works on mainnet.

## 2. Configuration findings that must be resolved

The checked-in `src/frontend/env.json` currently contains literal `undefined` values for `backend_host`, `backend_canister_id`, `project_id`, and `ii_derivation_origin`.

The checked-in `src/frontend/canister.yaml` build script writes:
- `backend_host` as `http://localhost:8081`
- `backend_canister_id` from `$BACKEND_CANISTER_ID`
- `project_id` as literal `undefined`
- `ii_derivation_origin` as literal `undefined`

Therefore a successful generic Vite build is not evidence of a correctly configured production frontend. Before any deployment, establish the documented source and correct value for every required field from the actual target deployment/platform configuration. Do not invent values or silently replace placeholders with guessed IDs/origins. Add a fail-fast configuration validation step once the authoritative variable names and formats are confirmed.

## 3. Required evidence before a test deployment

Record all of the following in a private release record (never commit secrets):
1. Target network and environment (local, test, staging, or mainnet).
2. Backend and frontend canister IDs from authoritative deployment records.
3. Controller list and the identity authorized to administer each canister.
4. Current module hashes and whether an upgrade would preserve existing stable state.
5. Internet Identity derivation origin and exact allowed frontend origin.
6. Runtime environment values, with no literal `undefined`, empty strings, localhost endpoints in production, or mismatched canister IDs.
7. Candid interface generated from the exact backend Wasm/source revision.
8. A reproducible build commit SHA and successful CI run for that exact SHA.

Do not place private keys, seed phrases, access tokens, or other secrets in this repository or release record.

## 4. Safe test sequence

Use a disposable non-production deployment with no user funds and no production controllers:
1. Verify authenticated and anonymous login behavior.
2. Verify read-only ICP Ledger balance lookup against a known test principal/account.
3. Verify that the returned balance is labelled as the user's ledger balance, not platform escrow or an internal app credit.
4. Confirm every unsupported value-moving action remains unavailable and cannot be invoked through direct actor calls.
5. Test authorization boundaries, including anonymous callers, arbitrary authenticated callers, and the designated owner.
6. Test frontend refresh/deep links, actor initialization, network errors, and missing configuration behavior.
7. Capture logs, transaction IDs (test network only), and expected-versus-actual outcomes.

Never use a real user's mainnet funds to validate unfinished flows.

## 5. Critical backend security gate

The current source audit identified a first-caller administrator bootstrap risk: the first authenticated caller to `initializeAccessControl()` can initialize access control and receive CEO privileges if the canister is uninitialized.

Do not invoke this method on a live uninitialized canister. Resolve the legitimate owner from authoritative controller/deployment records, then redesign initialization to fail closed and test:
- anonymous caller rejected;
- arbitrary authenticated caller rejected;
- only the verified owner/admin can initialize;
- repeated initialization cannot transfer or reset ownership;
- upgrade and stable-state behavior is preserved.

Do not hardcode an unverified principal or perform a live bootstrap as an experiment.

## 6. Feature gates

Keep these features disabled until their complete on-chain path and tests exist:
- ICP deposit reconciliation and any platform escrow claims;
- ICP withdrawals;
- ICRC token canister creation and deployment fees;
- ICRC token transfers;
- DEX quotes, approvals, swaps, settlement, and slippage handling;
- liquidity operations and fee collection.

A UI control being hidden is not sufficient. Backend methods must reject unsupported operations as well.

## 7. Production release checklist

Production release remains blocked until all items are evidenced:
- [ ] Verified owner/admin principal and safe one-time bootstrap.
- [ ] Verified canister IDs, controllers, module hashes, and stable-state compatibility.
- [ ] Correct frontend runtime configuration, including II derivation origin.
- [ ] Generated Candid bindings match the deployed backend interface.
- [ ] Deposit model is explicit and independently reviewed.
- [ ] Withdrawals are caller-authorized, replay-safe, fee-aware, destination-validated, and tested.
- [ ] Token creation has a reviewed controller policy, cycles budget, supply/metadata validation, fee handling, and failure recovery.
- [ ] DEX route has quote validation, slippage limits, caller authorization, settlement checks, and failure recovery.
- [ ] Independent security review and non-production end-to-end test evidence.
- [ ] Explicit release approval from the project owner.

## 8. Current decision

**NOT READY FOR PRODUCTION.** Source CI passing is useful but insufficient. Preserve the existing Caffeine app and draft pull request. Do not merge or publish production assets, upgrade mainnet canisters, change controllers, migrate state, or move funds until every gate above is closed and explicitly approved.
