# API Documentation

Base URL: `EXPO_PUBLIC_API_URL` in the Expo client, e.g. `http://<LAN-IP>:8000/api`.

Unless noted, protected endpoints require `Authorization: Bearer <Sanctum token>` and return JSON. Collection/resource reads generally use `{ "data": ... }`; mutations use `{ "message": "...", "data": ... }` where applicable. Laravel validation failures normally use HTTP 422 with an `errors` object.

## Authentication

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| POST | `/register` | No | `name`, `email`, `password`, `password_confirmation` | 201; `message`, `user`, `token` |
| POST | `/login` | No | `email`, `password` | `message`, `user`, `token` |
| POST | `/auth/google` | No | `id_token` | `message`, `user`, `token` |
| POST | `/logout` | Yes | none | `message` |
| GET | `/user` | Yes | none | `{ user }`, with contacts loaded |
| GET | `/me` | Yes | none | `{ data: user }` |

Passwords must be at least eight characters during registration. Login invalid credentials are surfaced as a validation exception on `email`.

## Items and metadata

| Method | Path | Auth | Active frontend wrapper / use |
| --- | --- | --- | --- |
| GET | `/items` | Yes | `getItems()`; current user's items with category, location, owner, current borrowing |
| GET | `/items/discover` | Yes | `discoverItems()`; reciprocal contacts' borrowable stored items, excluding requester's pending requests |
| POST | `/items` | Yes | Create item; accepts multipart image or fields below |
| GET | `/items/{item}` | Yes | `getItem()`; owner-only detail/history |
| PUT/POST + `_method=PUT` | `/items/{item}` | Yes | `updateItem()` / multipart `updateItemWithImage()`; owner-only |
| DELETE | `/items/{item}` | Yes | `deleteItem()`; owner-only |
| POST | `/items/{id}/make-borrowable` | Yes | `toggleItemBorrowable()` |
| GET | `/items/{item}/image` | Yes | `image_url`; streams private image if caller is owner or item is stored/borrowable |
| GET | `/items/{item}/history` | Yes | `getItemHistory()`; owner-only |
| GET | `/items/{item}/history/{history}` | Yes | owner-only |
| GET/POST/GET/PUT/DELETE | `/categories[/{category}]` | **No route middleware** | category CRUD; frontend wrapper is currently empty |
| GET/POST/GET/PUT/DELETE | `/locations[/{location}]` | **No route middleware** | create uses `createLocation()` |

Create/update item fields: `name` required; optional `category_id`, `location_id`, `serial_number`, `purchase_date`, `image` (jpg/jpeg/png/webp, max 5 MB), `description`, and `notes`. Create additionally accepts `is_borrowable` as integer and always sets `status` to `stored`. The current update validator does not accept `is_borrowable`; toggle uses its separate endpoint.

Location create accepts nullable `name`, `description`, `address`, `latitude` (-90..90), and `longitude` (-180..180). Each coordinate is required if the other is present. Location update only validates `name` and `description`, which is a known contract limitation.

## Contacts and friend requests

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/contacts` | Yes | Current contacts with `contactUser` and borrowings count; only rows with a different `contact_user_id` |
| POST | `/contacts` | Yes | Legacy/manual contact creation; name required, optional user link/contact data |
| GET/PUT/DELETE | `/contacts/{contact}` | Yes | Owner-scoped legacy contact CRUD |
| GET | `/users/search?query=...` | Yes | User search; query must be at least two characters; excludes self; maximum 20 |
| GET | `/friend-requests/sent` | Yes | Sent requests with receiver |
| GET | `/friend-requests/incoming` | Yes | Received requests with sender |
| POST | `/friend-requests` | Yes | `{ "receiver_id": number }`; disallows self, pending duplicate, and accepted relation |
| PATCH | `/friend-requests/{friendRequest}` | Yes | `{ "status": "accepted" | "rejected" }`; recipient only |

Accepting a friend request atomically creates reciprocal contact rows. A rejected request can be followed by another request because duplicate lookup only blocks latest accepted/pending states.

## Borrowing requests (active mobile workflow)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/borrowing-requests/my` | Yes | Requester's requests with item, owner, category, location |
| GET | `/borrowing-requests/incoming` | Yes | Requests for the current user's items with item and requester |
| POST | `/items/{item}/borrowing-request` | Yes | Create request; `expected_return_at` nullable date >= now, `notes` nullable string |
| POST | `/borrowing-requests/{id}/approve` | Yes | Owner-only; creates borrowing and rejects competing pending requests |
| POST | `/borrowing-requests/{id}/reject` | Yes | Owner-only pending request rejection |
| POST | `/borrowing-requests/{id}/cancel` | Yes | Requester-only pending request cancellation |

Creation rejects owners, non-reciprocal contacts, non-borrowable items, currently borrowed items, and duplicate pending requester/item pairs. Common business-rule errors are explicit 403 or 409 messages.

## Direct borrowing APIs (legacy/coexisting workflow)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/borrowings` | Yes | Borrowings where a contact row references the current user |
| POST | `/items/{item}/borrow` | Yes | Owner directly lends an owned item to an owned contact |
| POST | `/borrowings/{borrowing}/return` | Yes | Owner marks a borrowing returned |
| GET | `/items/{item}/borrowings` | Yes | Owner-only item borrowing history |
| GET | `/borrowings/{borrowing}` | Yes | Owner-only borrowing detail |

The direct workflow validates `contact_id` belongs to the owner for creation and prevents concurrent borrowings through `currentBorrowing()`. It is not the flow used by the current request UI.

## Return request controller: implemented but not routed

`ReturnRequestController` has methods for incoming/my requests and create/approve/reject/cancel behavior. However, `backend/routes/api/return_requests.php` is empty, and `routes/api.php` only loads the files that exist. No corresponding API paths are reachable from the inspected routing code. Do not build a frontend client for return requests without first registering, validating, and testing the routes.

## Response examples

Successful borrow request:

```json
{
  "message": "Borrowing request sent successfully.",
  "data": {
    "id": 12,
    "item_id": 7,
    "requester_id": 3,
    "expected_return_at": "2026-12-01T00:00:00.000000Z",
    "notes": "Need it for the weekend.",
    "status": "pending"
  }
}
```

Validation error shape (Laravel default):

```json
{
  "message": "The email field is required.",
  "errors": { "email": ["The email field is required."] }
}
```

For exact serialized relationship fields, inspect the relevant Eloquent resource response at runtime; controllers return Eloquent models directly and do not use API Resource classes.
