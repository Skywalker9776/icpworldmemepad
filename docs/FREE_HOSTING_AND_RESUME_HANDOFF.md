# ICPWorld Memepad: saved handoff and no-cost hosting route

Last verified: 2026-10-31
Repository: https://github.com/Skywalker9776/icpworldmemepad
Working branch: `icpworld-onchain-upgrade`
Open draft PR: https://github.com/Skywalker9776/icpworldmemepad/pull/1
Existing app: https://icpmemeworld-65u.caffeine.xyz

## Preservation / resume point

Continue the existing repository, branch, pull request, and Caffeine project. Do not create a replacement app or overwrite user data. PR #1 is open, draft, and not merged. Its head at this checkpoint is `2e1b1cfae79035b3d8bcc6cedcfe52a8602c5d08`.

The last verified code CI run is GitHub Actions run #28, for commit `f542b2078e8c43ff2042c33aea9da6675da0a153`. Frontend typecheck/build and backend Motoko check/build passed on that code commit. A later documentation-only commit updated the handoff. Passing CI is not a live deployment test.

Caffeine project ID: `019a508c-c4f1-71c5-a0d5-c7301bb967fb`. The hosted builder previously returned `out_of_credits`; do not keep retrying generation while credits are unavailable. The last known hosted draft/version was 66. No new build or deployment was made in this checkpoint.

## Free frontend hosting alternative

A free static host can serve the React/Vite frontend while the Motoko backend remains on Internet Computer. This is a frontend hosting workaround, not a free replacement for ICP canister compute/storage.

The repository's frontend package is `src/frontend`; its build command is `pnpm --filter @caffeine/template-frontend build`, and its generated static output is `src/frontend/dist`. The repository root uses pnpm workspaces and a frozen lockfile.

Candidate route: connect this GitHub repository to Cloudflare Pages (Free plan) or use GitHub Pages with a GitHub Actions deployment workflow. Suggested Cloudflare Pages settings after configuration is corrected:
- Framework preset: Vite
- Root directory: repository root
- Build command: `pnpm install --frozen-lockfile && pnpm --filter @caffeine/template-frontend build`
- Build output directory: `src/frontend/dist`
- Build environment: Node.js 22, pnpm 9

Do not publish yet: `src/frontend/env.json` currently contains placeholder `undefined` values for `backend_host`, `backend_canister_id`, `project_id`, and `ii_derivation_origin`. The static site must not be advertised as a working dapp until these values are generated from the actual intended deployment and the app is tested against the real canister. Never guess canister IDs or derivation origins. If the frontend relies on Caffeine-only storage or infrastructure, verify those dependencies before switching hosts.

GitHub Pages can also host static files, but the repository must have Pages enabled for Actions deployments and the Vite base path must match the Pages URL if hosted under a project subpath. Do not add a Pages deployment workflow until the final URL/base path and valid runtime configuration are known.

## Backend and on-chain reality

The Motoko backend still needs a real ICP canister deployment and cycles. GitHub Pages/Cloudflare Pages cannot execute Motoko canister code. ICP canister cycles are not eliminated by free frontend hosting.

Current blockers:
1. Admin bootstrap must not permit an arbitrary first authenticated caller to become admin/CEO. Verify the legitimate owner principal and use a secure, fail-closed initialization design. Never put a secret or owner identity into a public frontend variable.
2. Confirm actual production canister IDs, controllers, access-control initialization state, and deployed stable state before any upgrade.
3. Replace placeholders through the authoritative deployment/build workflow, not guessed values or manual edits to generated files.
4. Deposit reconciliation, wallet-authorized ICP withdrawals, ICRC token-canister creation, real DEX swaps, fee collection, and liquidity actions remain incomplete. Keep them disabled; never simulate success.
5. The currently described principal-derived ICP account is user-controlled, not a canister escrow account. Do not tell users funds are deposited into a platform-controlled vault.

## Safe continuation sequence

1. Keep this branch and PR #1 as the source of truth. Re-check the branch head before every edit.
2. Compare the branch with the current Caffeine source before syncing anything.
3. Resolve the admin bootstrap and verify canister identity/controller/stable-state facts.
4. Generate valid deployment configuration from the target environment.
5. Run CI and test a non-production deployment.
6. Only then configure Cloudflare Pages or GitHub Pages for the frontend and verify Internet Identity sign-in, routing, storage dependencies, and backend calls.
7. Implement and independently test each real on-chain transaction path before enabling its UI.
8. Do not merge, publish, upgrade production canisters, change controllers, migrate data, deploy tokens, or move funds without a separate explicit release decision and verification.

## Security reminder

A privileged Caffeine admin URL/token was previously exposed in conversation history. Treat it as compromised and revoke/rotate it in Caffeine. Do not copy it into GitHub, code, environment variables, or this document.

## Release status

**NOT READY FOR PRODUCTION.** This file is the durable resume point. No production deployment, canister upgrade, controller change, data migration, funds movement, token launch, or DEX transaction was performed for this checkpoint.
