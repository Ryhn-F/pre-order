# PO Automation API Documentation

This document provides comprehensive documentation for all available API endpoints in the PO Automation system.

---

## Table of Contents

- [Authentication](#authentication)
  - [Login](#post-apiauthlogin)
  - [Logout](#post-apiauthlogout)
- [Products](#products)
  - [Get All Products](#get-apiproducts)
- [Orders](#orders)
  - [Create Order](#post-apicreate-order)
  - [Get All Orders (Dashboard)](#get-apidashboardorder)

---

## Base URL

```
http://localhost:3000
```

---

## Authentication

The API uses session-based authentication with HTTP-only cookies. After successful login, a `session_token` cookie is automatically set and sent with subsequent requests.

### POST `/api/auth/login`

Authenticate a user and create a session.

#### Request

| Field      | Type     | Required | Description    |
| ---------- | -------- | -------- | -------------- |
| `username` | `string` | ✅       | Admin username |
| `password` | `string` | ✅       | Admin password |

**Example Request:**

```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secret123"
}
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin"
  }
}
```

**Error (400) - Missing Fields:**

```json
{
  "success": false,
  "message": "Username and password are required"
}
```

**Error (401) - Invalid Credentials:**

```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

---

### POST `/api/auth/logout`

End the current user session.

#### Request

No request body required. Session token is read from cookies.

**Example Request:**

```json
POST /api/auth/logout
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Products

### GET `/api/products`

Retrieve all available products.

#### Request

No request body or parameters required.

**Example Request:**

```
GET /api/products
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "name": "Kaos Kelas XII-A",
      "stock": 100,
      "price": 75000
    },
    {
      "product_id": 2,
      "name": "Jaket Almamater",
      "stock": 50,
      "price": 150000
    }
  ],
  "total": 2
}
```

**Error (500):**

```json
{
  "success": false,
  "message": "Failed to fetch products"
}
```

---

## Orders

### POST `/api/create-order`

Create a new pre-order. This endpoint is public and does not require authentication.

#### Request

| Field        | Type     | Required | Description                          |
| ------------ | -------- | -------- | ------------------------------------ |
| `nama`       | `string` | ✅       | Customer name                        |
| `kelas`      | `string` | ✅       | Customer class (e.g., "XII-A")       |
| `no_telp`    | `string` | ✅       | Customer phone number                |
| `product_id` | `number` | ✅       | ID of the product to order           |
| `quantity`   | `number` | ✅       | Quantity to order (must be positive) |

**Example Request:**

```json
POST /api/create-order
Content-Type: application/json

{
  "nama": "John Doe",
  "kelas": "XII-A",
  "no_telp": "08123456789",
  "product_id": 1,
  "quantity": 2
}
```

#### Response

**Success (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nama": "John Doe",
    "kelas": "XII-A",
    "no_telp": "08123456789",
    "product_id": 1,
    "quantity": 2,
    "product_name": "Kaos Kelas XII-A",
    "product_price": 75000,
    "total_price": 150000
  }
}
```

**Error (400) - Missing Fields:**

```json
{
  "success": false,
  "message": "All fields are required: nama, kelas, no_telp, product_id, quantity"
}
```

**Error (400) - Invalid Quantity:**

```json
{
  "success": false,
  "message": "Quantity must be a positive number"
}
```

**Error (400) - Insufficient Stock:**

```json
{
  "success": false,
  "message": "Insufficient stock. Available: 5, Requested: 10"
}
```

**Error (404) - Product Not Found:**

```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### GET `/api/dashboard/order`

Retrieve all orders with product details. **Requires authentication.**

#### Request

| Query Param | Type     | Required | Default | Description              |
| ----------- | -------- | -------- | ------- | ------------------------ |
| `page`      | `number` | ❌       | `1`     | Page number              |
| `limit`     | `number` | ❌       | `50`    | Number of items per page |

**Example Request:**

```
GET /api/dashboard/order?page=1&limit=20
Cookie: session_token=<valid_token>
```

#### Response

**Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nama": "John Doe",
      "kelas": "XII-A",
      "no_telp": "08123456789",
      "product_id": 1,
      "product_name": "Kaos Kelas XII-A",
      "product_price": 75000,
      "quantity": 2,
      "total_price": 150000
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "nama": "Jane Smith",
      "kelas": "XII-B",
      "no_telp": "08198765432",
      "product_id": 2,
      "product_name": "Jaket Almamater",
      "product_price": 150000,
      "quantity": 1,
      "total_price": 150000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Error (401) - Unauthorized:**

```json
{
  "success": false,
  "message": "Unauthorized. Please login first."
}
```

---

## Middleware & Route Protection

### Protected Routes

All routes under `/dashboard/*` are protected by middleware. Unauthenticated users will be redirected to the login page (`/`).

### Session Token

- **Cookie Name:** `session_token`
- **Expiration:** 24 hours
- **Type:** HTTP-only, Secure (in production)

### Authentication Flow

```
┌─────────────────┐         ┌─────────────────┐
│   User Login    │────────▶│  POST /api/     │
│   (username,    │         │  auth/login     │
│    password)    │         └────────┬────────┘
└─────────────────┘                  │
                                     ▼
                          ┌─────────────────┐
                          │ Session Token   │
                          │ Set in Cookie   │
                          └────────┬────────┘
                                   │
                                   ▼
┌─────────────────┐         ┌─────────────────┐
│   Access        │────────▶│   Middleware    │
│   /dashboard    │         │   Validates     │
│                 │         │   Token         │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
          ┌─────────────────┐              ┌─────────────────┐
          │ Valid Token     │              │ Invalid/Missing │
          │ → Allow Access  │              │ → Redirect to / │
          └─────────────────┘              └─────────────────┘
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### Common HTTP Status Codes

| Code | Description                                   |
| ---- | --------------------------------------------- |
| 200  | Success                                       |
| 201  | Created (for POST requests that create data)  |
| 400  | Bad Request (validation errors)               |
| 401  | Unauthorized (authentication required/failed) |
| 404  | Not Found                                     |
| 500  | Internal Server Error                         |

---

## Database Schema Reference

### `pre_orders` Table

| Column       | Type     | Description                   |
| ------------ | -------- | ----------------------------- |
| `id`         | `uuid`   | Primary key                   |
| `nama`       | `string` | Customer name                 |
| `kelas`      | `string` | Customer class                |
| `no_telp`    | `string` | Customer phone number         |
| `product_id` | `number` | Foreign key to products table |
| `quantity`   | `number` | Order quantity                |

### `products` Table

| Column       | Type     | Description     |
| ------------ | -------- | --------------- |
| `product_id` | `number` | Primary key     |
| `name`       | `string` | Product name    |
| `stock`      | `number` | Available stock |
| `price`      | `number` | Product price   |

### `user_admin` Table

| Column     | Type     | Description    |
| ---------- | -------- | -------------- |
| `id`       | `uuid`   | Primary key    |
| `username` | `string` | Admin username |
| `password` | `string` | Admin password |

---

## Example Usage (JavaScript/TypeScript)

### Login

```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "secret123",
  }),
});

const data = await response.json();
if (data.success) {
  // Redirect to dashboard
  window.location.href = "/dashboard";
}
```

### Create Order

```typescript
const response = await fetch("/api/create-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nama: "John Doe",
    kelas: "XII-A",
    no_telp: "08123456789",
    product_id: 1,
    quantity: 2,
  }),
});

const data = await response.json();
if (data.success) {
  console.log("Order created:", data.order);
}
```

### Fetch Orders (Dashboard)

```typescript
const response = await fetch("/api/dashboard/order?page=1&limit=20", {
  credentials: "include", // Important: include cookies
});

const data = await response.json();
if (data.success) {
  console.log("Orders:", data.data);
  console.log("Total pages:", data.pagination.totalPages);
}
```
