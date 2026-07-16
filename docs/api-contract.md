# MindEase — API Contract Documentation
Version 1.0 · Sprint 2

Base URL (dev): `http://localhost:PORT/api`

Auth: session-based via Better Auth. Authenticated routes require a valid session
cookie. No real names, emails, or photos are ever accepted or returned.

---

## Auth

### `POST /auth/signup`
Create a pseudonymous account.

**Request body**
```json
{
  "username": "string (3-32 chars, unique)",
  "password": "string (min 8 chars)"
}
```

**Response — 201 Created**
```json
{
  "id": "uuid",
  "username": "string",
  "createdAt": "ISO8601 timestamp"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | Missing/invalid fields |
| 409  | Username already taken |

---

### `POST /auth/login`
**Request body**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response — 200 OK**
```json
{
  "id": "uuid",
  "username": "string"
}
```
Sets session cookie.

**Errors**
| Code | Reason |
|------|--------|
| 400  | Missing fields |
| 401  | Invalid credentials |

---

### `POST /auth/logout`
**Response — 200 OK** — clears session cookie.

---

## Issue Tags

### `GET /issue-tags`
List all available issue types for matching.

**Auth required:** No

**Response — 200 OK**
```json
[
  { "id": "uuid", "name": "burnout" },
  { "id": "uuid", "name": "anxiety" },
  { "id": "uuid", "name": "grief" },
  { "id": "uuid", "name": "relationship stress" }
]
```

---

## Matching

### `POST /match`
Match the logged-in user to an available counsellor by issue type. Deducts one
session credit and creates a `pending` session.

**Auth required:** Yes

**Request body**
```json
{
  "issueTagId": "uuid"
}
```

**Response — 201 Created**
```json
{
  "sessionId": "uuid",
  "counsellor": {
    "id": "uuid",
    "displayName": "string",
    "bio": "string"
  },
  "status": "pending",
  "creditsRemaining": 0
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | Invalid or missing `issueTagId` |
| 401  | Not authenticated |
| 403  | Insufficient session credits |
| 404  | No available counsellor for this issue tag |

---

## Sessions

### `GET /sessions/:id`
Fetch session details (for chat screen header, status, etc.).

**Auth required:** Yes (must be a participant in the session)

**Response — 200 OK**
```json
{
  "id": "uuid",
  "status": "pending | active | completed | cancelled",
  "counsellor": { "id": "uuid", "displayName": "string" },
  "issueTag": { "id": "uuid", "name": "string" },
  "createdAt": "ISO8601 timestamp"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401  | Not authenticated |
| 403  | Not a participant in this session |
| 404  | Session not found |

---

## Messages

### `GET /sessions/:id/messages`
Fetch all messages in a session, ordered by `createdAt` ascending.

**Auth required:** Yes (must be a participant)

**Response — 200 OK**
```json
[
  {
    "id": "uuid",
    "senderRole": "user | counsellor",
    "content": "string",
    "createdAt": "ISO8601 timestamp"
  }
]
```

**Errors**
| Code | Reason |
|------|--------|
| 401  | Not authenticated |
| 403  | Not a participant in this session |
| 404  | Session not found |

---

### `POST /sessions/:id/messages`
Send a message within a session.

**Auth required:** Yes (must be a participant)

**Request body**
```json
{
  "content": "string (1-2000 chars)"
}
```

**Response — 201 Created**
```json
{
  "id": "uuid",
  "senderRole": "user | counsellor",
  "content": "string",
  "createdAt": "ISO8601 timestamp"
}
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | Empty or oversized content |
| 401  | Not authenticated |
| 403  | Not a participant, or session not `active`/`pending` |
| 404  | Session not found |

---

## Credits

### `GET /credits`
Get the logged-in user's current session-credit balance.

**Auth required:** Yes

**Response — 200 OK**
```json
{
  "balance": 1
}
```

**Errors**
| Code | Reason |
|------|--------|
| 401  | Not authenticated |

---

## Error Response Shape (all endpoints)
```json
{
  "error": {
    "code": "string (e.g. INSUFFICIENT_CREDITS)",
    "message": "human-readable string"
  }
}
```

## Standard HTTP Error Codes Used
| Code | Meaning |
|------|---------|
| 400  | Bad request — validation failure |
| 401  | Not authenticated |
| 403  | Authenticated but not authorized for this resource |
| 404  | Resource not found |
| 409  | Conflict (e.g. duplicate username) |
| 500  | Server error |

## Explicitly Out of Scope (Sprint 2)
- Voice-modulated calls
- Real payment/escrow processing
- Clinical record-keeping or diagnosis tools
