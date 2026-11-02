# ICPWorld Memepad: on-chain readiness audit

Audit date: 2026-11-01
Repository: https://github.com/Skywalker9776/icpworldmemepad
Branch: `icpworld-onchain-upgrade`

## Scope and safety

This is a source-code review of the current branch, not a live-canister inspection. No canister was called, no funds were moved, no deployment was made, and no production configuration was changed.

## Verified blockers

### Critical: first-caller administrator bootstrap

In `src/backend/main.mo`, `initializeAccessControl()` initializes the access-control state using the caller of the first non-anonymous invocation, then assigns that caller CEO privileges. An arbitrary first authenticated caller could therefore become administrator/CEO if this method is exposed on an uninitialized canister.

Release requirement: establish the legitimate owner principal through authoritative canister-controller/deployment records, then implement and test a fail-closed bootstrap. Do not call this method on a live uninitialized canister. Do not guess or hardcode an unverified principal.

### Critical: frontend runtime configuration is placeholder data

`src/frontend/env.json` contains the literal string `undefined` for:
- `backend_host`
- `backend_canister_id`
- `project_id`
- `ii_derivation_origin`

Release requirement: generate these values from the verified target deployment and validate Internet Identity origin and backend connectivity. Never guess canister IDs or derivation origins.


### Critical: Caffeine build template preserves placeholder identity configuration

The checked-in `src/frontend/canister.yaml` writes `project_id` and `ii_derivation_origin` as literal `undefined` during its build, while the backend canister ID is sourced from `BACKEND_CANISTER_ID` and the backend host is set to localhost. The checked-in `src/frontend/env.json` also contains placeholder values. A generic CI build passing does not validate the Caffeine deployment-generated runtime configuration.

Release requirement: establish the authoritative source and variable names for project ID and Internet Identity derivation origin, validate all required values before building, and fail the deployment build rather than shipping placeholders or localhost values to production. See [deployment and release runbook](DEPLOYMENT_RELEASE_RUNBOOK.md).

### High: real ICP withdrawal is not implemented

`withdrawICP()` unconditionally traps with a message that real withdrawals are not enabled. No withdrawal is performed.

Release requirement: implement authenticated, wallet-authorized transfer logic with destination validation, fee handling, replay protection, and tests before enabling any withdrawal UI.

### High: token creation is not implemented

`createMemecoin()` unconditionally traps because on-chain ICRC token deployment is not configured. No real token canister is created and no creation fee is collected.

Release requirement: implement and test a secure token-canister creation flow, including controller policy, metadata/supply validation, cycles budgeting, fee handling, and failure recovery.

### High: swaps and token transfers are not implemented

`tradeMemecoin()` unconditionally traps because DEX swaps and ICRC transfers are not integrated. No trade is executed.

Release requirement: integrate a real supported DEX/ledger route, verify quote and slippage constraints, use caller-authorized transfers, and test settlement and failure cases.

### Deposit semantics must be described accurately

`getVerifiedICPBalance()` reads the ICP Ledger balance for an account whose owner is the caller principal and whose subaccount is derived from that principal. This is a balance read, not deposit reconciliation into a platform-controlled escrow wallet. It does not credit the app's legacy internal wallet balance.

Release requirement: clearly label this as a user-controlled ledger account unless a separately audited canister-controlled custody design is implemented. Do not describe it as platform escrow or claim deposits are reconciled.

## Release gates

- [ ] Verify target canister IDs, controllers, module hashes, and deployed stable-state compatibility from authoritative records.
- [ ] Replace first-caller bootstrap with owner-verified, fail-closed initialization.
- [ ] Add tests proving anonymous and arbitrary authenticated callers cannot initialize admin privileges.
- [ ] Generate valid frontend environment configuration from the target deployment.
- [ ] Keep withdrawal, token creation, swap, fee collection, and liquidity controls disabled until each real path is implemented and tested.
- [ ] Verify frontend login, routing, storage dependencies, and backend calls on a non-production deployment.
- [ ] Obtain explicit release approval before merging, publishing, upgrading canisters, changing controllers, migrating data, launching tokens, or moving funds.

## Current status

**NOT READY FOR PRODUCTION.** The existing Caffeine app and draft PR should be preserved. Static hosting alone does not make the backend live or implement the missing on-chain transaction paths.

## CI verification update (2026-11-01)

GitHub Actions run **41271730583** for commit `eba8c92f36830ed3c99224fb50053c1ec73ad9d5` completed successfully.

- Frontend job: dependency installation, frontend typecheck, and frontend build all passed.
- Backend job: pinned Motoko toolchain/package installation, Motoko type and stable-compatibility checks, and backend compilation all passed.

This is useful source-level CI evidence, but it does **not** verify live canister IDs/controllers, runtime environment configuration, admin bootstrap safety, Internet Identity origin, ledger deposits/withdrawals, token deployment, DEX swaps, or production behavior. The release status therefore remains **NOT READY FOR PRODUCTION** until the release gates above are closed.


## Deployment runbook

A step-by-step evidence checklist and safe non-production test sequence is maintained in [docs/DEPLOYMENT_RELEASE_RUNBOOK.md](DEPLOYMENT_RELEASE_RUNBOOK.md). It records the distinction between passing source CI and a verified production deployment.
