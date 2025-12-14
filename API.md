# Sweet Shop Management System - API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

The API uses **JWT (JSON Web Token)** for authentication. Most endpoints require authentication, and some require admin privileges.

### Getting an Access Token

1. **Register** a new user using `POST /api/auth/register`
2. **Login** using `POST /api/auth/login` to receive an access token
3. Include the token in subsequent requests using the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

### Token Format

The token is returned in the following format:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Token Expiration

Tokens expire after **30 minutes** (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` in environment variables).

---

## API Endpoints

### Authentication Endpoints

#### 1. Register a New User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account. All users are created as regular users by default. Admin status must be set manually.

**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Request Schema:**
- `email` (string, required): Valid email address
- `password` (string, required): User password

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true
}
```

**Error Responses:**
- `400 Bad Request`: Email already registered
  ```json
  {
    "detail": "Email already registered"
  }
  ```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

---

#### 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT access token.

**Authentication:** Not required (Public)

**Request Body:** (Form Data - OAuth2 Password Flow)
```
username: user@example.com
password: securepassword123
```

**Note:** The `username` field should contain the user's email address.

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Incorrect email or password
  ```json
  {
    "detail": "Incorrect email or password"
  }
  ```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword123"
```

---

### Sweets Endpoints

#### 3. Get All Sweets

**Endpoint:** `GET /api/sweets`

**Description:** Retrieves a list of all available sweets with pagination support.

**Authentication:** Not required (Public)

**Query Parameters:**
- `skip` (integer, optional): Number of records to skip (default: 0)
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Chocolate Bar",
    "category": "Chocolate",
    "price": 2.50,
    "quantity": 50,
    "image_url": "https://example.com/chocolate.jpg"
  },
  {
    "id": 2,
    "name": "Gummy Bears",
    "category": "Gummy",
    "price": 1.75,
    "quantity": 100,
    "image_url": null
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/sweets?skip=0&limit=10"
```

---

#### 4. Search Sweets

**Endpoint:** `GET /api/sweets/search`

**Description:** Search for sweets by name, category, or price range. All parameters are optional and can be combined.

**Authentication:** Not required (Public)

**Query Parameters:**
- `q` (string, optional): Search term to match against sweet name (case-insensitive, partial match)
- `category` (string, optional): Filter by category (case-insensitive, partial match)
- `price_min` (float, optional): Minimum price filter
- `price_max` (float, optional): Maximum price filter

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Dark Chocolate",
    "category": "Chocolate",
    "price": 3.00,
    "quantity": 25,
    "image_url": null
  }
]
```

**Example Requests:**
```bash
# Search by name
curl -X GET "http://localhost:8000/api/sweets/search?q=chocolate"

# Filter by category
curl -X GET "http://localhost:8000/api/sweets/search?category=Gummy"

# Filter by price range
curl -X GET "http://localhost:8000/api/sweets/search?price_min=1.0&price_max=3.0"

# Combined search
curl -X GET "http://localhost:8000/api/sweets/search?q=chocolate&category=Chocolate&price_max=5.0"
```

---

#### 5. Create Sweet

**Endpoint:** `POST /api/sweets`

**Description:** Creates a new sweet in the inventory.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "New Chocolate Bar",
  "category": "Chocolate",
  "price": 2.99,
  "quantity": 100,
  "image_url": "https://example.com/image.jpg"
}
```

**Request Schema:**
- `name` (string, required): Name of the sweet
- `category` (string, required): Category of the sweet
- `price` (float, required): Price of the sweet
- `quantity` (integer, required): Initial stock quantity
- `image_url` (string, optional): URL to the sweet's image

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "New Chocolate Bar",
  "category": "Chocolate",
  "price": 2.99,
  "quantity": 100,
  "image_url": "https://example.com/image.jpg"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
  ```json
  {
    "detail": "Not authenticated"
  }
  ```
- `403 Forbidden`: User is not an admin
  ```json
  {
    "detail": "Not enough permissions"
  }
  ```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Chocolate Bar",
    "category": "Chocolate",
    "price": 2.99,
    "quantity": 100,
    "image_url": "https://example.com/image.jpg"
  }'
```

---

#### 6. Update Sweet

**Endpoint:** `PUT /api/sweets/{sweet_id}`

**Description:** Updates an existing sweet. All fields are optional - only provided fields will be updated.

**Authentication:** Required (Admin only)

**Path Parameters:**
- `sweet_id` (integer, required): ID of the sweet to update

**Request Body:**
```json
{
  "name": "Updated Chocolate Bar",
  "price": 3.50,
  "category": "Premium Chocolate"
}
```

**Request Schema:**
- `name` (string, optional): Updated name
- `category` (string, optional): Updated category
- `price` (float, optional): Updated price
- `quantity` (integer, optional): Updated quantity
- `image_url` (string, optional): Updated image URL

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Updated Chocolate Bar",
  "category": "Premium Chocolate",
  "price": 3.50,
  "quantity": 50,
  "image_url": null
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Sweet not found
  ```json
  {
    "detail": "Sweet not found"
  }
  ```

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/sweets/1" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Chocolate Bar",
    "price": 3.50
  }'
```

---

#### 7. Delete Sweet

**Endpoint:** `DELETE /api/sweets/{sweet_id}`

**Description:** Permanently deletes a sweet from the inventory.

**Authentication:** Required (Admin only

**Path Parameters:**
- `sweet_id` (integer, required): ID of the sweet to delete

**Response:** `204 No Content` (No response body)

**Error Responses:**
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Sweet not found
  ```json
  {
    "detail": "Sweet not found"
  }
  ```

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/sweets/1" \
  -H "Authorization: Bearer <admin_token>"
```

---

### Inventory Management Endpoints

#### 8. Purchase Sweet

**Endpoint:** `POST /api/sweets/{sweet_id}/purchase`

**Description:** Purchases a sweet, decreasing its quantity by 1. This endpoint is available to all authenticated users.

**Authentication:** Required (Any authenticated user)

**Path Parameters:**
- `sweet_id` (integer, required): ID of the sweet to purchase

**Response:** `200 OK`
```json
{
  "message": "Purchase successful",
  "remaining_quantity": 49
}
```

**Error Responses:**
- `400 Bad Request`: Out of stock
  ```json
  {
    "detail": "Out of stock"
  }
  ```
- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Sweet not found
  ```json
  {
    "detail": "Sweet not found"
  }
  ```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/sweets/1/purchase" \
  -H "Authorization: Bearer <user_token>"
```

---

#### 9. Restock Sweet

**Endpoint:** `POST /api/sweets/{sweet_id}/restock`

**Description:** Increases the quantity of a sweet in inventory. This endpoint is only available to admin users.

**Authentication:** Required (Admin only)

**Path Parameters:**
- `sweet_id` (integer, required): ID of the sweet to restock

**Request Body:**
```json
{
  "amount": 50
}
```

**Request Schema:**
- `amount` (integer, required): Number of items to add to inventory (must be positive)

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.50,
  "quantity": 100,
  "image_url": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid restock amount
  ```json
  {
    "detail": "Restock amount must be positive"
  }
  ```
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User is not an admin
- `404 Not Found`: Sweet not found
  ```json
  {
    "detail": "Sweet not found"
  }
  ```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/sweets/1/restock" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50
  }'
```

---

## Data Models

### User Model
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_active": true
}
```

**Note:** The `is_admin` field is not returned in the API response for security reasons.

### Sweet Model
```json
{
  "id": 1,
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.50,
  "quantity": 50,
  "image_url": "https://example.com/image.jpg"
}
```

---

## Error Responses

All error responses follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request data or business logic error
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions (e.g., admin-only endpoint)
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error (invalid data format)

---

## Rate Limiting

Currently, the API does not implement rate limiting. In a production environment, rate limiting should be implemented to prevent abuse.

---

## API Documentation (Interactive)

FastAPI automatically generates interactive API documentation:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

These interactive docs allow you to:
- View all available endpoints
- See request/response schemas
- Test endpoints directly from the browser
- View example requests and responses

---

## Example Workflow

### 1. Register and Login
```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"
```

### 2. Browse Sweets
```bash
# Get all sweets
curl -X GET "http://localhost:8000/api/sweets"

# Search for chocolates
curl -X GET "http://localhost:8000/api/sweets/search?q=chocolate"
```

### 3. Purchase a Sweet (as regular user)
```bash
curl -X POST "http://localhost:8000/api/sweets/1/purchase" \
  -H "Authorization: Bearer <user_token>"
```

### 4. Admin Operations (as admin)
```bash
# Create a new sweet
curl -X POST "http://localhost:8000/api/sweets" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Sweet",
    "category": "Candy",
    "price": 1.99,
    "quantity": 100
  }'

# Restock a sweet
curl -X POST "http://localhost:8000/api/sweets/1/restock" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50}'
```

---

## Notes

1. **Password Security:** Passwords are hashed using bcrypt before storage. Never send passwords in API responses.

2. **Admin Users:** Regular users cannot register as admins. Admin status must be set manually in the database or using the admin creation script.

3. **Token Storage:** Store JWT tokens securely. Do not expose them in client-side code or commit them to version control.

4. **Database:** The API uses SQLite by default. For production, consider using PostgreSQL or another production-grade database.

5. **CORS:** The API is configured to accept requests from `http://localhost:5173` (Vite default) and `http://localhost:3000` (React default). Adjust CORS settings in production.

---

## Support

For issues or questions, please refer to the main [README.md](README.md) file or check the interactive API documentation at `/docs`.

