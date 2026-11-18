# Architecture

## Repository layout

```text
inventory-app/
├── frontend/                 # Active Expo React Native app
│   ├── src/app/              # Expo Router pages and layouts
│   ├── src/api/              # Axios-backed endpoint wrappers
│   ├── src/components/       # Reusable visual components
│   ├── src/features/         # Borrowing, contact, and item feature code
│   ├── src/constants/theme.ts
│   ├── src/types/ and src/utils/
│   └── android/              # Native Android project
├── backend/                  # Laravel 13 API
│   ├── app/Http/Controllers/Api/
│   ├── app/Models/
│   ├── database/migrations/
│   └── routes/api/*.php
├── docs/                     # Handover documentation
└── src/                      # Inactive legacy duplicate: do not use
```

## Frontend

### Routing and navigation

Expo Router has a root stack at `frontend/src/app/_layout.tsx`. `frontend/src/app/index.tsx` redirects to `/auth`; it does not restore a session before redirecting.

- `auth/`: login, registration, and its stack layout.
- `app/_layout.tsx`: authenticated-area stack; declares tab navigation plus modal item creation and contacts routes.
- `app/tabs/_layout.tsx`: Home, My Items, Borrowed, Contacts, and Profile tabs, rendered through `components/layout/CustomTabBar.tsx`.
- `app/items/[id].tsx`: owned-item detail/edit screen. The backend `GET /items/{id}` is owner-scoped.
- `app/tabs/contacts.tsx`: tab-route wrapper for `app/contacts/index.tsx`.

`app/explore.tsx` and several generic Expo starter components remain in the active tree but are not part of the tab flow verified above.

### API and state flow

Endpoint wrappers live in `frontend/src/api/`. `axios.ts` sets the API base URL, adds `Authorization: Bearer <token>` from `utils/auth.ts`, and logs requests/responses/errors. Screens mostly use local React state plus `useFocusEffect` and explicit pull-to-refresh; React Query is installed but not used by the inspected active feature flow.

Authentication sequence:

1. Login/register wrapper posts credentials to Laravel.
2. The returned Sanctum token is stored in AsyncStorage with key `auth_token`.
3. Axios adds that token on later API calls.
4. Logout calls the API and removes the local token in the Profile flow.

The root layout mounts `react-native-toast-message`, allowing screens to use temporary success/error notices.

### Styling and UI conventions

Native components use `StyleSheet.create()` and theme values from `frontend/src/constants/theme.ts` (`colors`, `spacing`, `radius`). The theme file also contains Expo template color exports used by starter-style components. Path alias `@/*` maps to `frontend/src/*`.

Item pictures use `expo-image`. Since the image route needs authentication, image callers supply a bearer header. `utils/media.ts` rewrites Laravel-generated `localhost` URLs to the configured Expo API origin, which is important for Android devices and LAN development.

### Feature boundaries

- `features/items/`: creation/edit forms, image picker, map/date fields, services and hooks.
- `features/borrowings/`: detailed cards, request modal, and the request-loading/action hook.
- `features/contacts/`: contact card and form. The active screen primarily exposes friend-request/current-contact behavior.
- `components/item-details/`: composable detail cards, item history, current borrowing, and item actions.

## Backend

### Route organization

`backend/routes/api.php` discovers every `backend/routes/api/*.php` file. Most protected routes are wrapped in `auth:sanctum`; category and location resource routes are currently not protected in their route files. Route-model binding is used only in selected places; many controllers receive integer IDs and owner-scope the query manually.

`backend/bootstrap/app.php` returns JSON for `api/*` exceptions and avoids redirecting unauthenticated API clients to a web login path.

### Models and domain relationships

Users own `items` and `contacts`. An accepted friendship is materialized as two `contacts` rows, each pointing at the other user with `contact_user_id`. Items belong to their owner, category, and location; they have borrowings, borrowing requests, and histories. Borrowing request approval creates an actual borrowing; return requests operate on that borrowing.

### Access control patterns

- Item CRUD and history list/detail are scoped through `$request->user()->items()`.
- Contacts CRUD is scoped through `$request->user()->contacts()`.
- Discover requires a reciprocal contact pair, not merely a one-way `contacts` row.
- Requesting a borrow also verifies reciprocal contact status, excludes the owner, and requires `is_borrowable` and stored/no-current-borrowing conditions.
- Approval/rejection endpoints compare resource ownership/requester IDs to the authenticated user.

These checks are implemented controller-by-controller; there are no visible Laravel policy classes in the inspected source.

### Transactions and state transitions

Friend-request acceptance uses a transaction, updates the request, and creates reciprocal contact rows. Borrowing-request approval also uses a transaction to create a borrowing, mark the item `borrowed`, add history, approve the selected request, and reject other pending requests for that item. Return-request approval similarly marks a borrowing returned, restores item status, creates history, and rejects other pending return requests.

The direct owner-only `BorrowingController` APIs predate or coexist with the request workflow. See pending tasks for risks in that overlap.

### Private image delivery

The `items.image` route resolves an item, allows the owner or any caller for a borrowable/stored item, checks the private local disk, logs diagnostic metadata, and streams the file. Image access is not currently restricted to reciprocal contacts even though discover is.

## End-to-end borrowing flow

```text
friend request accepted
  -> reciprocal contacts created
  -> requester calls GET /items/discover
  -> requester sends POST /items/{id}/borrowing-request
  -> owner approves selected request in a transaction
  -> borrowing created; item becomes borrowed; siblings rejected
  -> borrower sees GET /borrowings
  -> return may be owner-direct or request-based, depending on route used
```

## Important architectural decisions and caveats

- Laravel storage paths, not temporary upload paths, must be persisted in `items.image`; the current controller uses `$file->store('items', 'local')`.
- The mobile app expects `{ data: ... }` for collections/resources and message-bearing mutation responses.
- The installed `@tanstack/react-query` dependency is not a shared query/cache layer yet. Avoid assuming invalidation occurs automatically.
- OpenAPI attributes are uneven: many controllers have them, but routes and payload documentation are not fully generated/verified in this handover.
