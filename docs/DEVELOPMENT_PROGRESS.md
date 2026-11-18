# Development Progress

Status reflects source inspected on 2026-11-18, not a production acceptance test.

## Implemented

### Authentication and application shell

- Email/password registration and login return Sanctum tokens; the client saves them in AsyncStorage.
- Login screen has a modern purple gradient/card design. Social-login controls are deliberately hidden with `SHOW_SOCIAL`; forgot-password button is a no-op placeholder.
- Root Expo layout mounts global toast notifications.
- Authenticated area has five custom-tab-bar destinations: Home, My Items, Borrowed, Contacts, Profile.

### Items

- Owned item list supports grid/list presentation, pull-to-refresh, add navigation, status summary, image placeholders, and authenticated `expo-image` loading.
- Create/edit forms include category/location/details/image support. Item updates now create a single `item_histories` record containing human-readable changed-field lines when a field actually changes.
- Item detail is owner-scoped and uses componentized information/history/current-borrowing cards. Detail close control is an X with back fallback.
- Private image storage and image streaming are in place. The server logs image access/missing-file diagnostics; client has temporary verbose image diagnostics in the item list.
- `resolveMediaUrl` works around Laravel URLs generated with `localhost` while the Expo client uses a LAN host.

### Contacts

- Contacts navigation route and custom tab exist.
- Contacts screen has Current, Requests, and Sent views.
- User search excludes the authenticated user; friend requests can be sent, received, accepted, or rejected.
- Acceptance creates a two-way contact relationship in one transaction.
- Current contacts endpoint filters out legacy/manual contacts without `contact_user_id` and avoids listing self.

### Borrowing

- Borrowed tab has Discover, My requests, and Incoming views; detailed cards show images/item metadata.
- Discover search, category filter, and client-side pagination reduce long lists.
- Borrow request modal has date selection, item preview, notes, and toast feedback.
- Discovery only returns stored/borrowable items owned by reciprocal contacts, not the user, and hides an item from a requester after their pending request.
- Borrow request creation repeats the reciprocal-contact requirement server-side.
- Approval creates a borrowing, updates item status/history, and automatically rejects other pending requests for the same item.
- Custom tab bar obtains incoming friend and borrowing request counts and displays badges. It refreshes based on focus rather than an interval.

## Partially implemented or unverified

- The Home screen is static placeholder UI: its counts render em dashes rather than API-backed values.
- Return request controller behavior is written but its modular route file is empty, so the feature is not reachable via HTTP and has no verified mobile UI.
- Google login endpoint exists but no verified active frontend integration is present.
- Category API wrapper file is empty; categories are present in backend, but full category management was not verified in the mobile UI.
- Location creation exists in the mobile API wrapper and forms, but no complete location-management screen was verified.
- There is a direct owner-managed borrowing controller alongside the newer request flow. Compatibility was inspected but not end-to-end tested.
- Image diagnostics recently proved that broken records may store transient PHP temp paths rather than storage-relative paths. Re-uploading repaired affected data; no migration/repair command exists for already missing files.

## Known quality and technical-debt issues

- `frontend/src/components/layout/CustomTabBar.tsx` contains temporary console diagnostics for incoming badge counts. `frontend/src/app/app/tabs/items/index.tsx` contains temporary image token/load/error diagnostics.
- `frontend/src/api/axios.ts` logs every request, response, and error. Appropriate for development, but review before release because URLs and error data can be noisy/sensitive.
- Item image authorization allows any authenticated user to fetch a stored borrowable item's image, while item discovery itself is contact-restricted.
- Categories and locations route files are not protected by `auth:sanctum`; this may be intentional shared metadata or may be a security gap.
- `ItemController::makeItemBorrowable()` fetches the item globally rather than owner-scoping it, so authorization needs review.
- Existing API implementation uses direct Eloquent serialization rather than resource transformers, so fields can change when model visibility/relations change.
- Test suite only contains Laravel example tests. No feature tests cover item ownership, contacts, requests, or borrowing races.
- React Query is installed but not used as the shared cache; screens manually reload on focus/refresh.

## Verification evidence

- Repository structure, route files, migrations, controllers, models, package manifests, config, and recent Git commits were inspected.
- Recent commits show the borrowing/contact/item-edit work was committed (`aeeba27`, `8042f5c`, and predecessors).
- This documentation task did not run lint, TypeScript compile, migrations, application builds, or backend tests. Previous work reported full ESLint could expose existing issues; do not treat this document as a green CI result.
