# API Contracts Documentation

**E-Commerce Microservices System**
Universidad San Carlos de Guatemala - Software Avanzado - Práctica 5
Estudiante: Evelyn Alejandra Tray Gálvez - 202010856

## Overview

This document defines all API contracts for the e-commerce microservices system, including REST and GraphQL endpoints.

## Table of Contents

1. [User Service (REST)](#user-service-rest)
2. [Product Service (REST)](#product-service-rest)
3. [Order Service (GraphQL)](#order-service-graphql)
4. [Analytics Service (GraphQL)](#analytics-service-graphql)
5. [API Gateway](#api-gateway)

---

## User Service (REST)

**Base URL:** `http://localhost:3001`
**Technology:** Node.js + Express
**Port:** 3001

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "service": "user-service",
  "status": "healthy",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Get All Users
```http
GET /api/users
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2023-12-15T10:30:00.000Z"
    },
    {
      "id": "2",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "customer",
      "createdAt": "2023-12-15T10:31:00.000Z"
    }
  ]
}
```

#### Get User by ID
```http
GET /api/users/{id}
```

**Parameters:**
- `id` (string, required): User ID

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "createdAt": "2023-12-15T10:30:00.000Z",
    "updatedAt": "2023-12-15T10:30:00.000Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "error": "User not found"
}
```

#### Register User
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "3",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "customer",
    "createdAt": "2023-12-15T10:35:00.000Z",
    "updatedAt": "2023-12-15T10:35:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Email, password and name are required"
}
```

#### User Login
```http
POST /api/users/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2023-12-15T10:30:00.000Z"
    },
    "token": "mock-jwt-token-1-1702634100000"
  }
}
```

#### Update User
```http
PUT /api/users/{id}
```

**Parameters:**
- `id` (string, required): User ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "1",
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "admin",
    "createdAt": "2023-12-15T10:30:00.000Z",
    "updatedAt": "2023-12-15T11:00:00.000Z"
  }
}
```

#### Delete User
```http
DELETE /api/users/{id}
```

**Parameters:**
- `id` (string, required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### cURL Examples

```bash
# Health check
curl http://localhost:3001/health

# Get all users
curl http://localhost:3001/api/users

# Register new user
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"123456", "name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com", "password":"admin123"}'

# Get user by ID
curl http://localhost:3001/api/users/1

# Update user
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name", "email":"updated@example.com"}'

# Delete user
curl -X DELETE http://localhost:3001/api/users/1
```

---

## Product Service (REST)

**Base URL:** `http://localhost:3002`
**Technology:** Python + FastAPI
**Port:** 3002

### Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "service": "product-service",
  "status": "healthy",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Get All Products
```http
GET /api/products?skip=0&limit=100&category=Electronics
```

**Query Parameters:**
- `skip` (int, optional): Number of products to skip (default: 0)
- `limit` (int, optional): Maximum number of products to return (default: 100)
- `category` (string, optional): Filter by category

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "price": 1499.99,
    "category": "Electronics",
    "stock": 25,
    "created_at": "2023-12-15T10:30:00.000Z",
    "updated_at": "2023-12-15T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "iPhone 14 Pro",
    "description": "Latest Apple smartphone with advanced camera system",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50,
    "created_at": "2023-12-15T10:30:00.000Z",
    "updated_at": "2023-12-15T10:30:00.000Z"
  }
]
```

#### Get Product by ID
```http
GET /api/products/{product_id}
```

**Parameters:**
- `product_id` (string, required): Product UUID

**Response (Success):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell XPS 15",
  "description": "High-performance laptop with 16GB RAM and 512GB SSD",
  "price": 1499.99,
  "category": "Electronics",
  "stock": 25,
  "created_at": "2023-12-15T10:30:00.000Z",
  "updated_at": "2023-12-15T10:30:00.000Z"
}
```

**Response (Not Found):**
```json
{
  "detail": "Product not found"
}
```

#### Create Product
```http
POST /api/products
```

**Request Body:**
```json
{
  "name": "Gaming Mouse",
  "description": "High-precision gaming mouse with RGB lighting",
  "price": 79.99,
  "category": "Gaming",
  "stock": 100
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Gaming Mouse",
  "description": "High-precision gaming mouse with RGB lighting",
  "price": 79.99,
  "category": "Gaming",
  "stock": 100,
  "created_at": "2023-12-15T11:00:00.000Z",
  "updated_at": "2023-12-15T11:00:00.000Z"
}
```

#### Update Product
```http
PUT /api/products/{product_id}
```

**Parameters:**
- `product_id` (string, required): Product UUID

**Request Body:**
```json
{
  "name": "Updated Gaming Mouse",
  "price": 89.99,
  "stock": 150
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Updated Gaming Mouse",
  "description": "High-precision gaming mouse with RGB lighting",
  "price": 89.99,
  "category": "Gaming",
  "stock": 150,
  "created_at": "2023-12-15T11:00:00.000Z",
  "updated_at": "2023-12-15T11:30:00.000Z"
}
```

#### Delete Product
```http
DELETE /api/products/{product_id}
```

**Parameters:**
- `product_id` (string, required): Product UUID

**Response:** `204 No Content`

#### Get Products by Category
```http
GET /api/products/category/{category}
```

**Parameters:**
- `category` (string, required): Product category

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "price": 1499.99,
    "category": "Electronics",
    "stock": 25,
    "created_at": "2023-12-15T10:30:00.000Z",
    "updated_at": "2023-12-15T10:30:00.000Z"
  }
]
```

#### Update Product Stock
```http
PATCH /api/products/{product_id}/stock?quantity=10
```

**Parameters:**
- `product_id` (string, required): Product UUID
- `quantity` (int, required): Quantity to add/subtract from stock

**Response:**
```json
{
  "message": "Stock updated successfully",
  "new_stock": 35
}
```

### cURL Examples

```bash
# Health check
curl http://localhost:3002/health

# Get all products
curl http://localhost:3002/api/products

# Get products with pagination and filter
curl "http://localhost:3002/api/products?skip=0&limit=5&category=Electronics"

# Create new product
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Keyboard",
    "description": "Mechanical wireless keyboard with backlight",
    "price": 129.99,
    "category": "Electronics",
    "stock": 50
  }'

# Get product by ID
curl http://localhost:3002/api/products/550e8400-e29b-41d4-a716-446655440000

# Update product
curl -X PUT http://localhost:3002/api/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"price": 1399.99, "stock": 30}'

# Get products by category
curl http://localhost:3002/api/products/category/Electronics

# Update stock
curl -X PATCH "http://localhost:3002/api/products/550e8400-e29b-41d4-a716-446655440000/stock?quantity=-5"

# Delete product
curl -X DELETE http://localhost:3002/api/products/550e8400-e29b-41d4-a716-446655440000
```

---

## Order Service (GraphQL)

**Base URL:** `http://localhost:3003/graphql`
**Technology:** Node.js + Apollo Server
**Port:** 3003

### Schema Types

```graphql
type Order {
  id: ID!
  userId: String!
  status: OrderStatus!
  total: Float!
  items: [OrderItem!]!
  createdAt: String!
  updatedAt: String!
}

type OrderItem {
  id: ID!
  productId: String!
  productName: String!
  quantity: Int!
  price: Float!
}

type Cart {
  id: ID!
  userId: String!
  items: [CartItem!]!
  total: Float!
  updatedAt: String!
}

type CartItem {
  id: ID!
  productId: String!
  productName: String!
  quantity: Int!
  price: Float!
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
}

input OrderItemInput {
  productId: String!
  productName: String!
  quantity: Int!
  price: Float!
}

input CartItemInput {
  productId: String!
  productName: String!
  quantity: Int!
  price: Float!
}
```

### Queries

#### Get Orders
```graphql
query GetOrders($userId: String) {
  orders(userId: $userId) {
    id
    userId
    status
    total
    items {
      id
      productId
      productName
      quantity
      price
    }
    createdAt
    updatedAt
  }
}
```

**Variables:**
```json
{
  "userId": "user1"
}
```

**Response:**
```json
{
  "data": {
    "orders": [
      {
        "id": "1",
        "userId": "user1",
        "status": "COMPLETED",
        "total": 299.99,
        "items": [
          {
            "id": "1",
            "productId": "prod1",
            "productName": "Laptop",
            "quantity": 1,
            "price": 299.99
          }
        ],
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Single Order
```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    userId
    status
    total
    items {
      id
      productId
      productName
      quantity
      price
    }
    createdAt
    updatedAt
  }
}
```

#### Get Cart
```graphql
query GetCart($userId: String!) {
  cart(userId: $userId) {
    id
    userId
    items {
      id
      productId
      productName
      quantity
      price
    }
    total
    updatedAt
  }
}
```

### Mutations

#### Create Order
```graphql
mutation CreateOrder($userId: String!, $items: [OrderItemInput!]!) {
  createOrder(userId: $userId, items: $items) {
    id
    userId
    status
    total
    items {
      id
      productId
      productName
      quantity
      price
    }
    createdAt
    updatedAt
  }
}
```

**Variables:**
```json
{
  "userId": "user1",
  "items": [
    {
      "productId": "prod1",
      "productName": "Laptop",
      "quantity": 1,
      "price": 1499.99
    },
    {
      "productId": "prod2",
      "productName": "Mouse",
      "quantity": 2,
      "price": 25.99
    }
  ]
}
```

#### Update Order Status
```graphql
mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
  updateOrderStatus(id: $id, status: $status) {
    id
    userId
    status
    total
    updatedAt
  }
}
```

#### Add to Cart
```graphql
mutation AddToCart($userId: String!, $item: CartItemInput!) {
  addToCart(userId: $userId, item: $item) {
    id
    userId
    items {
      id
      productId
      productName
      quantity
      price
    }
    total
    updatedAt
  }
}
```

#### Remove from Cart
```graphql
mutation RemoveFromCart($userId: String!, $productId: String!) {
  removeFromCart(userId: $userId, productId: $productId) {
    id
    userId
    items {
      id
      productId
      productName
      quantity
      price
    }
    total
    updatedAt
  }
}
```

#### Checkout
```graphql
mutation Checkout($userId: String!) {
  checkout(userId: $userId) {
    id
    userId
    status
    total
    items {
      id
      productId
      productName
      quantity
      price
    }
    createdAt
    updatedAt
  }
}
```

### cURL Examples

```bash
# Get orders for user
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { orders(userId: \"user1\") { id status total items { productName quantity price } } }"
  }'

# Create order
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateOrder($userId: String!, $items: [OrderItemInput!]!) { createOrder(userId: $userId, items: $items) { id status total } }",
    "variables": {
      "userId": "user1",
      "items": [
        {
          "productId": "prod1",
          "productName": "Laptop",
          "quantity": 1,
          "price": 1499.99
        }
      ]
    }
  }'

# Add to cart
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addToCart(userId: \"user1\", item: { productId: \"prod1\", productName: \"Laptop\", quantity: 1, price: 1499.99 }) { total items { productName quantity } } }"
  }'

# Checkout
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { checkout(userId: \"user1\") { id status total } }"
  }'
```

---

## Analytics Service (GraphQL)

**Base URL:** `http://localhost:3004/graphql`
**Technology:** Python + Graphene
**Port:** 3004

### Schema Types

```graphql
type SalesReport {
  id: String
  period: String
  startDate: String
  endDate: String
  totalRevenue: Float
  totalOrders: Int
  averageOrderValue: Float
  generatedAt: String
}

type ProductStats {
  productId: String
  productName: String
  category: String
  totalSold: Int
  totalRevenue: Float
  averageRating: Float
  views: Int
  conversionRate: Float
}

type UserStatistics {
  userId: String
  username: String
  totalOrders: Int
  totalSpent: Float
  averageOrderValue: Float
  firstOrderDate: String
  lastOrderDate: String
  favoriteCategory: String
  status: String
}

type CategoryRevenue {
  category: String
  revenue: Float
  percentage: Float
}

type ReportGenerationResult {
  success: Boolean
  reportId: String
  message: String
  generatedAt: String
}
```

### Queries

#### Get Sales Report
```graphql
query GetSalesReport($startDate: String, $endDate: String) {
  salesReport(startDate: $startDate, endDate: $endDate) {
    id
    period
    startDate
    endDate
    totalRevenue
    totalOrders
    averageOrderValue
    generatedAt
  }
}
```

**Response:**
```json
{
  "data": {
    "salesReport": {
      "id": "report1",
      "period": "2023-Q4",
      "startDate": "2023-10-01",
      "endDate": "2023-12-31",
      "totalRevenue": 145000.50,
      "totalOrders": 1250,
      "averageOrderValue": 116.00,
      "generatedAt": "2023-12-15T10:30:00.000Z"
    }
  }
}
```

#### Get All Sales Reports
```graphql
query GetSalesReports {
  salesReports {
    id
    period
    totalRevenue
    totalOrders
    averageOrderValue
  }
}
```

#### Get Top Products
```graphql
query GetTopProducts($limit: Int) {
  topProducts(limit: $limit) {
    productId
    productName
    category
    totalSold
    totalRevenue
    averageRating
    conversionRate
  }
}
```

#### Get User Statistics
```graphql
query GetUserStatistics($userId: String) {
  userStatistics(userId: $userId) {
    userId
    username
    totalOrders
    totalSpent
    averageOrderValue
    firstOrderDate
    lastOrderDate
    favoriteCategory
    status
  }
}
```

#### Get Revenue by Category
```graphql
query GetRevenueByCategory {
  revenueByCategory {
    category
    revenue
    percentage
  }
}
```

### Mutations

#### Generate Report
```graphql
mutation GenerateReport($reportType: String!, $startDate: String, $endDate: String, $params: String) {
  generateReport(reportType: $reportType, startDate: $startDate, endDate: $endDate, params: $params) {
    success
    reportId
    message
    generatedAt
  }
}
```

**Variables:**
```json
{
  "reportType": "sales",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "params": "{\"includeDetails\": true}"
}
```

**Response:**
```json
{
  "data": {
    "generateReport": {
      "success": true,
      "reportId": "report_sales_1702634100",
      "message": "Sales report generated for period 2023-01-01 to 2023-12-31",
      "generatedAt": "2023-12-15T10:30:00.000Z"
    }
  }
}
```

### cURL Examples

```bash
# Get sales reports
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { salesReports { id period totalRevenue totalOrders } }"
  }'

# Get top products
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { topProducts(limit: 5) { productId productName totalRevenue totalSold } }"
  }'

# Get user statistics
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { userStatistics(userId: \"user1\") { username totalOrders totalSpent favoriteCategory } }"
  }'

# Get revenue by category
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { revenueByCategory { category revenue percentage } }"
  }'

# Generate report
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { generateReport(reportType: \"sales\", startDate: \"2023-01-01\", endDate: \"2023-12-31\") { success reportId message } }"
  }'
```

---

## API Gateway

**Base URL:** `http://localhost:3000`
**Technology:** Node.js + Express
**Port:** 3000

### Gateway Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2023-12-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "users": {
      "service": "user-service",
      "status": "healthy"
    },
    "products": {
      "service": "product-service",
      "status": "healthy"
    },
    "orders": {
      "service": "order-service",
      "status": "healthy"
    },
    "analytics": {
      "service": "analytics-service",
      "status": "healthy"
    }
  }
}
```

#### Gateway Information
```http
GET /
```

**Response:**
```json
{
  "service": "API Gateway",
  "description": "E-Commerce Microservices API Gateway",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "users": "/api/users/*",
    "products": "/api/products/*",
    "orders": "/api/orders/*",
    "ordersGraphQL": "/orders/graphql",
    "analytics": "/api/analytics/*",
    "analyticsGraphQL": "/analytics/graphql"
  },
  "documentation": {
    "products": "http://localhost:3002/docs",
    "analytics": "http://localhost:3004/docs",
    "ordersGraphQL": "http://localhost:3003/graphql",
    "analyticsGraphQL": "http://localhost:3004/graphql"
  }
}
```

### Proxy Routes

All service endpoints are accessible through the gateway with the following routing:

- **User Service:** `/api/users/*` → `http://localhost:3001/api/users/*`
- **Product Service:** `/api/products/*` → `http://localhost:3002/api/products/*`
- **Order Service REST:** `/api/orders/*` → `http://localhost:3003/api/orders/*`
- **Order Service GraphQL:** `/orders/graphql` → `http://localhost:3003/graphql`
- **Analytics Service REST:** `/api/analytics/*` → `http://localhost:3004/api/analytics/*`
- **Analytics Service GraphQL:** `/analytics/graphql` → `http://localhost:3004/graphql`

### Combined GraphQL Endpoint

```http
POST /graphql
```

The gateway provides a unified GraphQL endpoint that automatically routes queries to the appropriate service based on query content:

- Queries containing `order`, `cart`, `Order`, or `Cart` → Order Service
- Queries containing `sales`, `analytics`, `revenue`, or `Report` → Analytics Service

### Authentication

The gateway supports optional authentication middleware. When enabled, requests must include an `Authorization` header:

```http
Authorization: Bearer <token>
```

### Gateway cURL Examples

```bash
# Gateway health check
curl http://localhost:3000/health

# Get gateway information
curl http://localhost:3000/

# Proxy to user service through gateway
curl http://localhost:3000/api/users

# Proxy to product service through gateway
curl http://localhost:3000/api/products

# GraphQL through gateway (orders)
curl -X POST http://localhost:3000/orders/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { orders(userId: \"user1\") { id status total } }"
  }'

# GraphQL through gateway (analytics)
curl -X POST http://localhost:3000/analytics/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { topProducts(limit: 3) { productName totalRevenue } }"
  }'

# Combined GraphQL endpoint
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { orders(userId: \"user1\") { id status total } }"
  }'
```

---

## Error Handling

All services follow consistent error response formats:

### REST Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

### GraphQL Error Response
```json
{
  "data": null,
  "errors": [
    {
      "message": "Error description",
      "path": ["fieldName"],
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `502` - Bad Gateway (Gateway errors)

---

*Documentación generada para Práctica 5 - Software Avanzado 2025*