You are an engineering agent working in the Inventory App monorepo. Preserve the existing mobile/API contract unless a task explicitly changes it.

## CRITICAL DIRECTORY AND FILE RULES

1. **TARGET FRONTEND PATH:** All frontend code lives strictly inside `frontend/src/`.
2. **THE ROOT TRAP ARCHITECTURE:** A duplicate folder structure exists at the root `src/` directory. NEVER touch, read, write, or suggest paths in the root `src/` folder. It is an inactive legacy structure.
3. **BACKEND ACCESS:** You ARE allowed to inspect, modify, and generate backend code when necessary. However, backend modifications require EXTRA CARE.
   - First, inspect and understand the existing backend architecture before making changes.
   - Never assume backend file locations, framework conventions, database structures, or API contracts without verification.
   - Preserve existing functionality and avoid unnecessary modifications.
   - Check frontend/backend API compatibility before changing endpoints, request payloads, or response structures.
   - Follow existing backend coding standards and architectural patterns.
   - Prioritize backward compatibility.
   - Never modify database schemas or migrations without explaining the impact.
   - Exercise extra caution when modifying authentication, authorization, database transactions, security, and production-critical functionality.
   - Never expose credentials, API keys, tokens, or other sensitive information.
   - Clearly identify all backend files being modified and explain why each change is necessary.

## FILE PLACEMENT MATRIX

When generating or modifying frontend features, strict adherence to these exact sub-directories is required:

- Expo Router Layouts & Pages: `frontend/src/app/` (Use file-based routing: auth/, app/tabs/, items/)
- Contextual/Feature Modules: `frontend/src/features/` (e.g., categories/)
- Reusable UI Elements: `frontend/src/components/` (Include .web.tsx extensions if cross-platform is detected)
- Presentational Layouts: `frontend/src/screens/`
- Centralized Data Layer: `frontend/src/api/` (Must build on top of your existing `axios.ts`)
- State & Logic Extensions: `frontend/src/hooks/`
- TypeScript Formats: `frontend/src/types/`
- Helper Systems: `frontend/src/utils/`

## REACT NATIVE CODE GEN SPECS

- Ensure 100% compliance with standard Mobile Yoga layout engine rules (e.g., flex containers default to `flexDirection: 'column'`).
- Never inject web elements (`<div>`, `<span>`, `<h1>`) into native layout logic unless explicitly targeted in a `.web.tsx` file.
- Styles must use `StyleSheet.create()` from `react-native` using the strict system theme mappings found in `frontend/src/constants/theme.ts`.

## BACKEND DEVELOPMENT SAFETY SPECS

- Inspect existing backend implementation before proposing or applying changes.
- Maintain consistency with existing Laravel conventions, API architecture, validation, authentication, and authorization.
- Use database transactions for operations involving multiple related database changes.
- Validate all incoming data on the backend; never rely solely on frontend validation.
- Ensure proper error handling and consistent API response formats.
- Consider database performance, query efficiency, and race conditions.
- Write or update relevant tests when modifying backend behavior.
- Do not introduce new dependencies without justifying their necessity.
- If a backend change affects frontend functionality, identify and account for all affected frontend integrations.
- If requirements or existing implementations are unclear, ask for clarification instead of making risky assumptions.

## EXECUTION AND MODIFICATION RULES

Before outputting multi-file refactors, print the absolute file targets under `frontend/src/` to confirm context execution.

For backend modifications:
- Print the verified absolute paths of all backend files targeted for modification.
- Explain the purpose and expected impact of each change.
- Identify potential breaking changes and migration requirements.
- Never claim that a change was tested unless the relevant tests were actually executed.
- Summarize modified files, tests performed, and any remaining risks after implementation.

**GENERAL PRIORITY:** Preserve the existing architecture, minimize unnecessary changes, maintain frontend/backend compatibility, and prioritize correctness, security, and maintainability over implementation speed.

## VERIFIED PROJECT CONVENTIONS

- The active client is an Expo Router / React Native TypeScript app in `frontend/`; Laravel 13 is the API in `backend/`.
- API routes are split by domain in `backend/routes/api/*.php` and loaded dynamically by `backend/routes/api.php`. Add routes to a domain file; do not add an unrelated monolithic route file.
- Protected API routes use `auth:sanctum`. Mobile requests use a bearer token saved under `auth_token` in AsyncStorage. Extend `frontend/src/api/axios.ts`; do not create a competing HTTP client.
- API collection responses conventionally use `{ "data": ... }`; mutation responses also include `message`.
- Laravel item images are private (`storage/app/private/items`) and are served through the authenticated `GET /api/items/{item}/image` route. React Native image calls need the bearer header; use `resolveMediaUrl` for URLs generated with a localhost host.
- Keep frontend aliases (`@/`) and strict TypeScript. Use existing `colors`, `spacing`, and `radius` tokens in `frontend/src/constants/theme.ts`.
- Item mutations, approval flows, and relationship creation can change several records. Inspect existing transaction and authorization patterns before changing these flows; use a database transaction when one operation writes multiple related records.

## WORKFLOW AND VERIFICATION

1. Inspect the relevant active files first and state the exact frontend/backend files you intend to change.
2. Preserve public route paths, response envelopes, and existing request payload names unless a coordinated migration is requested.
3. For migration changes, document the schema impact and test fresh/upgraded database behavior. Never edit an already-applied migration to change production schema.
4. Run the narrowest relevant verification available: `npm.cmd run lint` or `npx tsc --noEmit` in `frontend`, and `php artisan test` / focused tests or at least `php -l` for edited PHP in `backend`.
5. Report commands actually run and results. Existing repository lint/test failures must be identified as pre-existing, not silently attributed to new changes.

## CURRENT HANDOVER DOCUMENTATION

Read `docs/PROJECT_OVERVIEW.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_DOCUMENTATION.md`, `docs/DEVELOPMENT_PROGRESS.md`, and `docs/PENDING_TASKS.md` before broad feature work. They describe the verified state as of 2026-11-18 and point out known limitations.
