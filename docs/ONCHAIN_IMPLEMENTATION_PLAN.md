# ICPWorld Memepad: On-Chain Upgrade Plan

Status: planning and safety baseline
Target branch: `icpworld-onchain-upgrade`
Production branch: `main` (untouched)

## Verified baseline from the inspected `src/backend/main.mo`

- The backend creates per-user ICP Ledger account identifiers using a principal-derived subaccount.
- The current `Wallet.balance` is an application-maintained number. The inspected backend does not query the ICP Ledger with `icrc1_balance_of`.
- `withdrawICP` deducts the application-maintained balance and creates a pending history record. The inspected function does not call `icrc1_transfer`.
- `createMemecoin` stores a `Memecoin` record and changes the application-maintained wallet balance for the creation fee. The inspected function does not deploy or register a token ledger.
- `getHotMemecoins`, `getTrendingMemecoins`, `getNewMemecoins`, and `getProgressingMemecoins` each return the first ten stored records rather than calculating a market ranking.
- The project uses Caffeine's `MixinAuthorization` plus a custom `initializeAccessControl` method that assigns its first non-anonymous caller as CEO. Caffeine's authorization extension documentation also describes first authenticated sign-in as the automatic admin bootstrap. This is safe only if the legitimate owner was the first authenticated user; the live role/CEO state and first-login identity are not verifiable from the repository. Do not change or reset roles until the deployed state and owner principal are independently verified.
- The frontend dependency manifest currently contains both legacy `@dfinity/*` packages and `@icp-sdk/core`; signer integration must be aligned with the actual installed SDK versions before implementation.

These are source-inspection findings, not proof of live-canister state or a complete audit of every external service.

## Current implementation status (2026-10-31)

Implemented on the development branch:
- Read-only ICP Ledger balance query for the same principal/subaccount used by the current deposit account.
- Frontend hook and Portfolio display for the verified Ledger balance, separated from the legacy app accounting balance.
- Frontend warning that deposit reconciliation and withdrawals are not enabled; users are told not to send ICP to the legacy address.
- Generated frontend actor bindings updated for the new balance method.
- Backend guards disable the old simulated withdrawal, token creation, trade approval, and internal-bookkeeping trade paths until real signer/ledger/token/DEX integrations exist.
- ICPSwap connection status now reports disconnected rather than returning a false positive.

Not implemented or not verified:
- No deposit event/indexer reconciliation or automatic crediting.
- No wallet signer integration or user-approved ICP transfer flow.
- No ICRC token canister deployment or initial supply distribution.
- No ICPSwap pool discovery, swap execution, or liquidity provision.
- Frontend TypeScript typecheck and production build pass in GitHub Actions.
- Motoko backend compiles successfully with the pinned Mops toolchain in GitHub Actions.
- A previous compiled `.most` snapshot from the untouched `main` branch has been restored at the configured `.old/src/backend/dist/backend.most` path. CI now runs `mops check backend` before building. This is a repository baseline, not independently verified against the live canister's actual deployed stable state or controller metadata.
- No live-canister verification or end-to-end integration test has been performed.
- No Caffeine draft promotion, canister deployment, or mainnet verification has been performed.

Important account model:
The current deposit address is derived from the user's own principal and subaccount. It is not a canister-controlled escrow account. The application can read that ledger account's balance, but it cannot spend from it without the user's wallet signing. Keep this user-controlled model unless a separately audited, explicitly disclosed custody model is designed.

## Non-negotiable safety requirements

1. Never represent an application database balance as a verified on-chain balance.
2. Never credit a deposit from a user-submitted transaction hash alone. Verify it against the ICP Ledger/index data, destination account, amount, asset, and block, and make crediting idempotent.
3. Never debit a user's balance and call a withdrawal complete before the ledger transfer succeeds. Persist a withdrawal intent, submit a ledger transfer with deduplication metadata, and reconcile the result including duplicate responses.
4. Query ledger fee and decimal metadata at runtime. Do not assume all ICRC ledgers use the ICP ledger's fee or decimals.
5. Require explicit user wallet approval for user-originated transfers. Internet Identity authentication is not a substitute for transaction signing.
6. Treat token creation as incomplete until an actual ICRC ledger canister exists, its metadata is verified, its controller/minting authority is documented, and the initial supply distribution is confirmed.
7. Treat trading as incomplete until real token transfers and a real supported DEX pool/swap path are integrated and independently verifiable.
8. Test locally or on a test environment before any mainnet operation. No real funds, secrets, or private keys are to be used in development tests.
9. Preserve existing stable state and Caffeine-generated files. Any schema migration must be explicit and upgrade-tested.
10. Do not merge into `main`, deploy a canister, change controllers, or move funds without the owner's separate approval.

## Implementation sequence

### Milestone 1: wallet and ledger truth
- Map current frontend wallet queries and all callers of `Wallet.balance`.
- Introduce an explicit distinction between verified ledger balance and any legacy application accounting value.
- Add read-only ICP Ledger balance and metadata queries.
- Add deposit discovery/reconciliation with ledger block references, duplicate protection, and an auditable state machine.
- Do not enable withdrawals until the deposit model and accounting invariants are tested.

### Milestone 2: withdrawals
- Design a withdrawal intent state machine: requested -> approved/submitted -> confirmed, or failed/retryable.
- Validate destination account, amount, fee, available funds, and caller authorization.
- Use a ledger transfer with `created_at_time` and handle `#Duplicate`, `#BadFee`, `#InsufficientFunds`, and transient errors.
- Reconcile uncertain outcomes before retrying to avoid duplicate payouts.

### Milestone 3: ICRC token launch
- Choose a documented token-ledger deployment model and controller policy.
- Implement token metadata, minting/distribution, indexer references, and verified token balances.
- Remove UI claims of on-chain deployment until a ledger canister and supply are confirmed.

### Milestone 4: DEX and market intelligence
- Integrate a verified ICP DEX pool/swap interface only after confirming its current public API and supported assets.
- Use actual pool liquidity, volume, swap events, and timestamps for rankings.
- Label unavailable data as unavailable; never substitute mock values.

## Acceptance tests

- A deposit is credited once only after matching an actual ledger block to the user's exact deposit account.
- A second processing attempt for the same block cannot credit again.
- A withdrawal cannot be marked confirmed without a successful ledger result.
- Replaying a withdrawal request cannot cause a second transfer.
- A wallet balance shown as verified matches the ledger query at the same observation point.
- A token launch cannot display a token ledger ID or "on-chain" status before deployment and verification.
- A trade cannot change token ownership unless the corresponding real token transfer/swap is confirmed.
- Existing users and stable data survive canister upgrades.

## Documentation used

- ICP developer documentation: https://docs.internetcomputer.org/guides/digital-assets/ledgers
- Digital asset standards: https://docs.internetcomputer.org/references/digital-asset-standards
- Wallet integration: https://docs.internetcomputer.org/guides/digital-assets/wallet-integration
- Motoko persistence and upgrade documentation: https://docs.internetcomputer.org/motoko/fundamentals/actors/orthogonal-persistence


## Additional frontend audit (2026-10-31)

A follow-up inspection of `src/frontend/src/pages/SwapPage.tsx` and `CreateMemecoinPage.tsx` found user-visible simulation that must be removed before a public release:

- SwapPage's `handleSwap` waits 1.5 seconds, appends a local "completed" swap-history item, and shows a success toast without submitting a DEX transaction.
- The swap screen displays a hardcoded ICP price of 12.45 and synthetic percentage changes derived from token symbols; these are not live market data.
- CreateMemecoinPage still presents a successful launch state with a fabricated contract-address string after the mutation callback. The backend now rejects token creation, so the UI must not imply that launch can succeed.
- The create page's fee panel and safety checklist still make claims about a 2 ICP charge, ownership cap, auto-locked liquidity, and on-chain deployment that have not been implemented or verified.

These were source-level findings from the development branch. The corresponding UI has since been corrected on the development branch, and the frontend typecheck and production build have passed in GitHub Actions. The release runbook in `docs/CAFFEINE_BUILD_AND_PUBLISH_RUNBOOK.md` gives the safe hosted-builder workflow and a complete remediation prompt.

## Deployment workflow clarification

Caffeine's documented workflow distinguishes building a draft from publishing a live app. The CLI can build/check and upload a draft preview; publishing/promoting to the live URL is done in the Caffeine web app. The repository's `deploy.sh` runs a local ICP network and is not a production Caffeine deployment script. Do not describe a GitHub commit as a live deployment.
