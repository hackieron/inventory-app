# Database Schema

This schema is derived from `backend/database/migrations/`, not inferred from TypeScript. Laravel's primary key helpers create bigint unsigned IDs; `timestamps()` creates nullable `created_at`/`updated_at` timestamps unless otherwise noted.

## Application tables

### `users`

- `id` primary key
- `name` string
- `email` string, unique
- `google_id` nullable string, unique
- `avatar` nullable string
- `email_verified_at` nullable timestamp
- `password` nullable string
- `remember_token` nullable string
- timestamps

Users own items and contacts. Sanctum token rows use Laravel polymorphic `tokenable` fields.

### `categories`

- `id` primary key
- `name` string
- `description` nullable text
- timestamps

There is no database unique constraint on `name`; the controller validates uniqueness.

### `locations`

- `id` primary key
- `name` string
- `description` nullable text
- `latitude` nullable decimal(10,7)
- `longitude` nullable decimal(10,7)
- `address` nullable string
- timestamps

Coordinates were added by the 2026-10 migration. Controller validation requires the coordinate pair together when either is supplied.

### `items`

- `id` primary key
- `user_id` foreign key to `users`, cascade delete
- `category_id` nullable foreign key to `categories`, set null on delete
- `location_id` nullable foreign key to `locations`, set null on delete
- `name` string
- `serial_number` nullable string, unique
- `status` string, defaults to `stored`
- `is_borrowable` boolean, defaults to `false`
- `purchase_date` nullable date
- `image` nullable string (private storage-relative path)
- `description` nullable text
- `notes` nullable text
- timestamps

`status` is application-managed; observed values include `stored` and `borrowed`.

### `contacts`

- `id` primary key
- `user_id` nullable foreign key to `users`, set null on delete
- `contact_user_id` nullable foreign key to `users`, set null on delete
- `name` string
- `email` nullable string
- `phone` nullable string
- `notes` nullable text
- timestamps

New friend acceptance creates two rows: A → B and B → A. There is no migration-level unique pair constraint, so controller logic (`firstOrCreate`) is relied on to reduce duplicates.

### `friend_requests`

- `id` primary key
- `sender_id` foreign key to `users`, cascade delete
- `receiver_id` foreign key to `users`, cascade delete
- `status` string, default `pending`
- timestamps
- indexes: (`receiver_id`, `status`) and (`sender_id`, `status`)

Observed status values enforced by the endpoint: `pending`, `accepted`, `rejected`.

### `borrowings`

- `id` primary key
- `item_id` foreign key to `items`, cascade delete
- `contact_id` foreign key to `contacts`, restrict delete
- `status` string, default `pending` (added after table creation)
- `borrowed_at` datetime, non-null in original schema
- `expected_return_at` nullable datetime
- `returned_at` nullable datetime
- `notes` nullable text
- timestamps

The current request-approval flow creates active borrowings without explicitly populating `status`; the application primarily determines active status from `returned_at IS NULL` and item status.

### `borrowing_requests`

- `id` primary key
- `item_id` foreign key to `items`, cascade delete
- `requester_id` foreign key to `users`, cascade delete
- `expected_return_at` nullable datetime
- `notes` nullable text
- `status` string, default `pending`
- timestamps
- indexes: (`item_id`, `status`) and (`requester_id`, `status`)

Observed endpoint state values: `pending`, `approved`, `rejected`, `cancelled`.

### `return_requests`

- `id` primary key
- `borrowing_id` foreign key to `borrowings`, cascade delete
- `requester_id` foreign key to `users`, cascade delete
- `status` string, default `pending`
- `notes` nullable text
- timestamps

The controller implements processing for these records, but `backend/routes/api/return_requests.php` was empty at inspection time, so no HTTP route exposed that controller behavior through the modular API loader.

### `item_histories`

- `id` primary key
- `item_id` foreign key to `items`, cascade delete
- `action` string
- `description` nullable text
- `old_location` nullable string
- `new_location` nullable string
- `contact_id` nullable foreign key to `contacts`, set null on delete
- timestamps

The controller writes history for item updates and borrowing/return operations. Edit history description is a newline-joined human-readable diff rather than structured JSON.

## Framework tables

- `password_reset_tokens`: email primary key, token, nullable `created_at`.
- `sessions`: string primary key, nullable `user_id` index, IP/user agent/payload/last activity.
- `cache`, `cache_locks`: database cache storage.
- `jobs`, `job_batches`, `failed_jobs`: queue support.
- `personal_access_tokens`: Sanctum polymorphic token table; token is unique and expiry is indexed.

## Relationship map

```text
User 1--* Item *--0..1 Category
              \--0..1 Location
              \--* Borrowing --1 Contact
              \--* BorrowingRequest --1 requester User
              \--* ItemHistory --0..1 Contact

User 1--* Contact --0..1 contact_user User
User 1--* FriendRequest (sender)
User 1--* FriendRequest (receiver)
Borrowing 1--* ReturnRequest --1 requester User
```

## Migration status and cautions

The repository contains 17 migrations, ending in `2026_11_18_000001_create_friend_requests_table.php`. This handover did not run `php artisan migrate:status`; therefore, it verifies migration files present in source, not their applied state in a particular developer database. Apply the friend-request migration before using its endpoints in a new or existing environment.

Several `down()` methods for additive migrations are empty (the `is_borrowable` and borrowing `status` additions). Rolling those migrations back will not remove their columns, so do not rely on full rollback for schema cleanup without fixing that intentionally in a separate migration plan.
