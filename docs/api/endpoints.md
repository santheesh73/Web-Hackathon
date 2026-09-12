# API Endpoints

## Base URL
- Development: `http://localhost:4000`

## Endpoints

### Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Description**: Verifies API availability and service status.
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "life-rpg-api"
  }
  ```

### Character Retrieval
- **Method**: `GET`
- **Path**: `/character`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves the authenticated user's persistent character profile.
- **Response**:
  ```json
  {
    "id": "char-123456789",
    "userId": "user-uuid",
    "name": "Valerius",
    "avatar": "warrior",
    "lifeFocus": "learning",
    "createdAt": "2026-09-12T00:00:00.000Z",
    "updatedAt": "2026-09-12T00:00:00.000Z"
  }
  ```

### Character Creation
- **Method**: `POST`
- **Path**: `/character`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new persistent character for the authenticated user. Enforces strict ownership and prevents duplicates (1 character per account).
- **Request Body**:
  ```json
  {
    "name": "Valerius",
    "avatar": "warrior",
    "lifeFocus": "learning"
  }
  ```
- **Response (201 Created)**: Returns the newly created `Character` object.
- **Response (409 Conflict)**: Returned if the user already has an active character:
  ```json
  {
    "error": "Character already exists for this account"
  }
  ```
