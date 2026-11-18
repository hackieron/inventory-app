# Inventory App: Project Overview

## Purpose

Inventory App is a mobile personal-inventory application. A signed-in user records items they own, assigns optional categories and locations, keeps an item history, and shares eligible items with accepted contacts through a request/approval borrowing flow.

The repository contains two applications:

- `frontend/`: the active Expo Router React Native client.
- `backend/`: the Laravel API and database migrations.

The root `src/` directory is an inactive duplicate/legacy structure. It is deliberately out of scope for implementation work.

## Primary use cases

- Create an account or sign in with email/password. The API also has a Google ID-token endpoint, although no verified active Google login UI is present.
- Create, edit, inspect, and delete items owned by the current user, including an optional private image.
- Mark an owned item as borrowable.
- Find other users, send/receive friend requests, and maintain the accepted-contact list.
- Discover borrowable **stored** items owned by reciprocal accepted contacts.
- Request an item, approve/reject/cancel requests, and view outgoing/incoming request lists.
- View borrowed-item history and item change history.

## Verified technology stack

| Area | Implementation |
| --- | --- |
| Mobile UI | Expo SDK 57, React Native 0.86, React 19, TypeScript (strict) |
| Routing | Expo Router file-based routes |
| Navigation | Expo Router / React Navigation bottom tabs with a custom tab bar |
| HTTP | Axios with an AsyncStorage-backed bearer-token interceptor |
| Images and device APIs | `expo-image`, image picker, location/maps, date picker |
| Feedback | `react-native-toast-message` mounted at the root layout |
| API | Laravel 13, PHP 8.3+, Eloquent, Sanctum |
| Storage | Laravel private local disk (`storage/app/private`) for item images |
| Database | Laravel migrations; local `.env.example` defaults to SQLite |
| API documentation | L5 Swagger/OpenAPI PHP attributes are present on many controllers |

## Active modules

- Authentication: email/password registration/login/logout and token persistence.
- Items: owned-item list, grid/list UI, create/edit/detail/delete, private image delivery, categories/locations, and audit history.
- Borrowing: discover, request modal, outgoing requests, incoming owner actions, borrowability, and item status transitions.
- Contacts: user search, sent/incoming friend requests, and a current accepted-contact tab.
- Shared UI: item-detail cards, custom tab bar and request badges, theme tokens, toast feedback.

## Entry points

- The Expo client starts through `frontend/package.json` scripts such as `npm.cmd start` and uses `frontend/src/app/_layout.tsx` as its root layout.
- The Laravel app uses `backend/artisan`; all domain route files in `backend/routes/api/` are required by `backend/routes/api.php`.
- `start-dev.ps1` opens `php artisan serve --host=192.168.100.147` in `backend` and `npm.cmd start` in `frontend`. That host is a local-network development setting, not a portable deployment configuration.

## Environment requirements

The mobile client reads `EXPO_PUBLIC_API_URL`, defaulting to Android emulator `http://10.0.2.2:8000/api`. The checked local frontend environment uses a LAN IP address. A physical device must be able to reach the selected API host.

Laravel needs the standard generated `APP_KEY`, a database configured through `backend/.env`, and migrations applied. The sample environment uses SQLite, database-backed cache/session/queue settings, and `FILESYSTEM_DISK=local`. Never commit populated `.env` secrets.

## Scope note

This overview describes implementation visible in the repository as of 2026-11-18. See `DEVELOPMENT_PROGRESS.md` and `PENDING_TASKS.md` for functionality that exists but is incomplete, legacy, or needs validation.
