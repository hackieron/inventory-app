# Pending Tasks and Recommended Priorities

## Priority 0: validate and secure existing behavior

1. Add Laravel feature tests for authentication, owner-only item access, contact reciprocity, borrowing request creation/approval, competing approvals, request cancellation, and item image authorization.
2. Run `php artisan migrate:status` and ensure `2026_11_18_000001_create_friend_requests_table.php` is applied in each required environment. Do not assume a developer database includes it.
3. Review authorization gaps:
   - Make `POST /items/{id}/make-borrowable` owner-scoped.
   - Decide whether categories/locations should be public; add `auth:sanctum` if not.
   - Align private-image access with the contact-only discovery rule if that is the intended privacy policy.
4. Resolve concurrent approval behavior rigorously. The current approval transaction rejects sibling pending requests, but it reads/checks the selected request/item before the transaction. Add appropriate row locking or an atomic availability guard and tests if real concurrent requests are expected.

## Priority 1: finish incomplete product flows

1. Choose and complete one return workflow. Either register and test `ReturnRequestController` routes plus client screens, or remove/deprecate it and keep owner-direct return as the supported path.
2. Implement real Home dashboard metrics for owned items, current borrowings, and incoming requests.
3. Decide whether manual contact CRUD is still a supported product feature. Current contacts UI is friend-request-first, and the list endpoint hides manual contacts with no `contact_user_id`.
4. Add a client-facing category/location management experience or remove unused API/form assumptions. Correct `LocationController::update` if address/coordinates must be editable.
5. Implement a deliberate session bootstrap/expired-token path instead of always redirecting `/` to `/auth` and relying on later request failures.

## Priority 2: code health and observability

1. Remove or gate development logs in Axios, the item list image loader, the item image controller, and CustomTabBar once image/badge investigation is complete.
2. Run and repair `npm.cmd run lint` in `frontend`; document and fix any existing rules incrementally. Also run `npx tsc --noEmit` after TypeScript changes.
3. Add API Resource classes or explicit response DTOs for stable public response contracts.
4. Consolidate legacy direct borrowing APIs and the request-based flow to avoid conflicting item/borrowing state rules. The unused `BorrowingController::request()` is especially confusing because its route is not registered.
5. Add database constraints/indexes for relationships where appropriate, after evaluating existing data: contact pair uniqueness, friend-request pair policy, and potentially a durable active-borrowing invariant.
6. Replace human-readable-only item history diffs with structured change data if histories will be filtered/audited programmatically. This requires an additive schema/API plan.

## Priority 3: deployment and configuration

1. Replace local LAN defaults with documented dev/staging/production environment configuration. `APP_URL` and Expo `EXPO_PUBLIC_API_URL` must agree on a reachable host for private image URLs.
2. Decide on a production filesystem disk and backup strategy for private item images.
3. Configure CORS, HTTPS, and Google OAuth client configuration for actual deployment; these settings were not verified in this handover.
4. Add CI that installs both apps and runs lint/type checks/PHP tests/migration checks.

## Risks and blockers

- Existing item rows whose `image` points to a deleted temporary upload path cannot be recovered by the image endpoint; they need a new upload or explicit data cleanup.
- The project has no domain-level test coverage, so endpoint behavior has mostly been verified by code inspection and manual development use.
- Backend route files are modular and glob-loaded. Adding a controller without adding a non-empty route definition does not expose it, as demonstrated by return requests.
- The frontend contains active starter/template components and an inactive root `src/` tree. A new agent must keep all real frontend changes under `frontend/src/`.

## Suggested next implementation sequence

1. Test and secure current borrowing/contact behavior.
2. Complete return requests or formally simplify the borrowing lifecycle.
3. Build real dashboard/session behavior.
4. Clean logs, lint/type issues, and API contract consistency.
5. Harden deployment/storage and CI.
