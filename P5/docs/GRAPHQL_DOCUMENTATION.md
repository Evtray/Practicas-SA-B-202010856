# GraphQL Documentation

**E-Commerce Microservices System**
Universidad San Carlos de Guatemala - Software Avanzado - Práctica 5
Estudiante: Evelyn Alejandra Tray Gálvez - 202010856

## Overview

This document provides comprehensive GraphQL documentation for the e-commerce microservices system. The system includes two GraphQL services: Order Service and Analytics Service.

## Table of Contents

1. [Order Service GraphQL](#order-service-graphql)
2. [Analytics Service GraphQL](#analytics-service-graphql)
3. [Schema Definitions](#schema-definitions)
4. [Example Queries and Mutations](#example-queries-and-mutations)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)

---

## Order Service GraphQL

**Endpoint:** `http://localhost:3003/graphql`
**Technology:** Node.js + Apollo Server
**Playground:** `http://localhost:3003/graphql`

### Complete Schema Definition

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

type Query {
  orders(userId: String): [Order!]!
  order(id: ID!): Order
  cart(userId: String!): Cart
}

type Mutation {
  createOrder(userId: String!, items: [OrderItemInput!]!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order
  addToCart(userId: String!, item: CartItemInput!): Cart!
  removeFromCart(userId: String!, productId: String!): Cart!
  checkout(userId: String!): Order!
}

schema {
  query: Query
  mutation: Mutation
}
```

### Field Descriptions

#### Order Type
- **id**: Unique identifier for the order
- **userId**: ID of the user who placed the order
- **status**: Current status of the order (see OrderStatus enum)
- **total**: Total amount of the order
- **items**: List of items in the order
- **createdAt**: ISO 8601 timestamp when order was created
- **updatedAt**: ISO 8601 timestamp when order was last updated

#### OrderItem Type
- **id**: Unique identifier for the order item
- **productId**: ID of the product
- **productName**: Name of the product at time of order
- **quantity**: Number of items ordered
- **price**: Price per item at time of order

#### Cart Type
- **id**: Unique identifier for the cart
- **userId**: ID of the user who owns the cart
- **items**: List of items in the cart
- **total**: Total amount of all items in cart
- **updatedAt**: ISO 8601 timestamp when cart was last updated

#### OrderStatus Enum
- **PENDING**: Order has been placed but not yet processed
- **PROCESSING**: Order is being prepared
- **SHIPPED**: Order has been shipped
- **DELIVERED**: Order has been delivered
- **COMPLETED**: Order is complete and paid
- **CANCELLED**: Order has been cancelled

### Example Queries

#### 1. Get All Orders for a User
```graphql
query GetUserOrders($userId: String!) {
  orders(userId: $userId) {
    id
    status
    total
    items {
      productName
      quantity
      price
    }
    createdAt
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
        "status": "COMPLETED",
        "total": 299.99,
        "items": [
          {
            "productName": "Laptop",
            "quantity": 1,
            "price": 299.99
          }
        ],
        "createdAt": "2023-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Get Single Order Details
```graphql
query GetOrderDetails($orderId: ID!) {
  order(id: $orderId) {
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

#### 3. Get User's Cart
```graphql
query GetUserCart($userId: String!) {
  cart(userId: $userId) {
    id
    total
    items {
      id
      productId
      productName
      quantity
      price
    }
    updatedAt
  }
}
```

### Example Mutations

#### 1. Create New Order
```graphql
mutation CreateNewOrder($userId: String!, $items: [OrderItemInput!]!) {
  createOrder(userId: $userId, items: $items) {
    id
    status
    total
    items {
      productName
      quantity
      price
    }
    createdAt
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
      "productName": "Gaming Laptop",
      "quantity": 1,
      "price": 1299.99
    },
    {
      "productId": "prod2",
      "productName": "Wireless Mouse",
      "quantity": 2,
      "price": 29.99
    }
  ]
}
```

#### 2. Update Order Status
```graphql
mutation UpdateOrder($orderId: ID!, $newStatus: OrderStatus!) {
  updateOrderStatus(id: $orderId, status: $newStatus) {
    id
    status
    updatedAt
  }
}
```

#### 3. Add Item to Cart
```graphql
mutation AddItemToCart($userId: String!, $item: CartItemInput!) {
  addToCart(userId: $userId, item: $item) {
    id
    total
    items {
      productName
      quantity
      price
    }
  }
}
```

#### 4. Remove Item from Cart
```graphql
mutation RemoveItemFromCart($userId: String!, $productId: String!) {
  removeFromCart(userId: $userId, productId: $productId) {
    id
    total
    items {
      productName
      quantity
    }
  }
}
```

#### 5. Checkout Cart
```graphql
mutation CheckoutCart($userId: String!) {
  checkout(userId: $userId) {
    id
    status
    total
    items {
      productName
      quantity
      price
    }
    createdAt
  }
}
```

---

## Analytics Service GraphQL

**Endpoint:** `http://localhost:3004/graphql`
**Technology:** Python + Graphene
**Documentation:** `http://localhost:3004/docs`

### Complete Schema Definition

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

type Query {
  salesReport(startDate: String, endDate: String): SalesReport
  salesReports: [SalesReport]
  topProducts(limit: Int = 10): [ProductStats]
  userStatistics(userId: String): UserStatistics
  allUserStatistics: [UserStatistics]
  revenueByCategory: [CategoryRevenue]
}

type Mutation {
  generateReport(
    reportType: String!
    startDate: String
    endDate: String
    params: String
  ): ReportGenerationResult
}

schema {
  query: Query
  mutation: Mutation
}
```

### Field Descriptions

#### SalesReport Type
- **id**: Unique identifier for the report
- **period**: Human-readable period description (e.g., "2023-Q4")
- **startDate**: Start date of the reporting period
- **endDate**: End date of the reporting period
- **totalRevenue**: Total revenue for the period
- **totalOrders**: Total number of orders
- **averageOrderValue**: Average value per order
- **generatedAt**: Timestamp when report was generated

#### ProductStats Type
- **productId**: Unique identifier for the product
- **productName**: Name of the product
- **category**: Product category
- **totalSold**: Total quantity sold
- **totalRevenue**: Total revenue from this product
- **averageRating**: Average customer rating
- **views**: Total number of product page views
- **conversionRate**: Percentage of views that resulted in purchases

#### UserStatistics Type
- **userId**: Unique identifier for the user
- **username**: User's display name
- **totalOrders**: Total number of orders placed
- **totalSpent**: Total amount spent by user
- **averageOrderValue**: Average value per order for this user
- **firstOrderDate**: Date of user's first order
- **lastOrderDate**: Date of user's most recent order
- **favoriteCategory**: Most frequently purchased category
- **status**: User status (e.g., "premium", "regular")

#### CategoryRevenue Type
- **category**: Product category name
- **revenue**: Total revenue for this category
- **percentage**: Percentage of total revenue

### Example Queries

#### 1. Get Sales Report by Date Range
```graphql
query GetSalesReport($startDate: String!, $endDate: String!) {
  salesReport(startDate: $startDate, endDate: $endDate) {
    id
    period
    totalRevenue
    totalOrders
    averageOrderValue
    generatedAt
  }
}
```

**Variables:**
```json
{
  "startDate": "2023-10-01",
  "endDate": "2023-12-31"
}
```

#### 2. Get All Sales Reports
```graphql
query GetAllSalesReports {
  salesReports {
    id
    period
    startDate
    endDate
    totalRevenue
    totalOrders
    averageOrderValue
  }
}
```

#### 3. Get Top Performing Products
```graphql
query GetTopProducts($limit: Int!) {
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

**Variables:**
```json
{
  "limit": 5
}
```

#### 4. Get User Statistics
```graphql
query GetUserStatistics($userId: String!) {
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

#### 5. Get Revenue Breakdown by Category
```graphql
query GetRevenueByCategory {
  revenueByCategory {
    category
    revenue
    percentage
  }
}
```

#### 6. Get All User Statistics
```graphql
query GetAllUserStatistics {
  allUserStatistics {
    userId
    username
    totalOrders
    totalSpent
    favoriteCategory
    status
  }
}
```

### Example Mutations

#### 1. Generate Sales Report
```graphql
mutation GenerateSalesReport($startDate: String!, $endDate: String!) {
  generateReport(
    reportType: "sales"
    startDate: $startDate
    endDate: $endDate
  ) {
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
  "startDate": "2023-01-01",
  "endDate": "2023-12-31"
}
```

#### 2. Generate Product Performance Report
```graphql
mutation GenerateProductReport {
  generateReport(reportType: "products") {
    success
    reportId
    message
    generatedAt
  }
}
```

#### 3. Generate User Analytics Report
```graphql
mutation GenerateUserReport {
  generateReport(reportType: "users") {
    success
    reportId
    message
    generatedAt
  }
}
```

#### 4. Generate Custom Report with Parameters
```graphql
mutation GenerateCustomReport($params: String!) {
  generateReport(
    reportType: "revenue"
    params: $params
  ) {
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
  "params": "{\"includeDetails\": true, \"groupBy\": \"month\"}"
}
```

---

## Schema Definitions

### Complete Combined Schema

For reference, here's how both services' schemas would look when combined in a federated GraphQL setup:

```graphql
# Order Service Types
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

# Analytics Service Types
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

# Input Types
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

# Queries
type Query {
  # Order Queries
  orders(userId: String): [Order!]!
  order(id: ID!): Order
  cart(userId: String!): Cart

  # Analytics Queries
  salesReport(startDate: String, endDate: String): SalesReport
  salesReports: [SalesReport]
  topProducts(limit: Int = 10): [ProductStats]
  userStatistics(userId: String): UserStatistics
  allUserStatistics: [UserStatistics]
  revenueByCategory: [CategoryRevenue]
}

# Mutations
type Mutation {
  # Order Mutations
  createOrder(userId: String!, items: [OrderItemInput!]!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order
  addToCart(userId: String!, item: CartItemInput!): Cart!
  removeFromCart(userId: String!, productId: String!): Cart!
  checkout(userId: String!): Order!

  # Analytics Mutations
  generateReport(
    reportType: String!
    startDate: String
    endDate: String
    params: String
  ): ReportGenerationResult
}
```

---

## Example Queries and Mutations

### Complex Business Logic Examples

#### 1. Complete Order Workflow
```graphql
# Step 1: Add items to cart
mutation AddToCart {
  addToCart(
    userId: "user123"
    item: {
      productId: "laptop-001"
      productName: "Gaming Laptop"
      quantity: 1
      price: 1299.99
    }
  ) {
    total
    items {
      productName
      quantity
    }
  }
}

# Step 2: Check cart before checkout
query CheckCart {
  cart(userId: "user123") {
    total
    items {
      productName
      quantity
      price
    }
  }
}

# Step 3: Checkout
mutation Checkout {
  checkout(userId: "user123") {
    id
    status
    total
    createdAt
  }
}

# Step 4: Update order status (admin action)
mutation UpdateStatus {
  updateOrderStatus(id: "order-456", status: PROCESSING) {
    id
    status
    updatedAt
  }
}
```

#### 2. Analytics Dashboard Data
```graphql
query DashboardData {
  # Overall sales performance
  salesReports {
    period
    totalRevenue
    totalOrders
  }

  # Top performing products
  topProducts(limit: 5) {
    productName
    totalRevenue
    totalSold
    conversionRate
  }

  # Revenue breakdown
  revenueByCategory {
    category
    revenue
    percentage
  }
}
```

#### 3. Customer Analysis
```graphql
query CustomerAnalysis($userId: String!) {
  # User statistics
  userStatistics(userId: $userId) {
    username
    totalOrders
    totalSpent
    averageOrderValue
    favoriteCategory
    status
  }

  # User's order history
  orders(userId: $userId) {
    id
    status
    total
    createdAt
    items {
      productName
      quantity
      price
    }
  }
}
```

---

## Error Handling

### GraphQL Error Format

GraphQL errors follow the standard GraphQL error specification:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Order not found",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["order"],
      "extensions": {
        "code": "NOT_FOUND",
        "exception": {
          "stacktrace": ["Error: Order not found", "    at resolveOrder..."]
        }
      }
    }
  ]
}
```

### Common Error Types

#### Order Service Errors
- **VALIDATION_ERROR**: Invalid input data
- **NOT_FOUND**: Order/Cart not found
- **CART_EMPTY**: Attempted checkout with empty cart
- **INSUFFICIENT_PERMISSIONS**: User doesn't have permission

#### Analytics Service Errors
- **INVALID_DATE_RANGE**: Invalid start/end dates
- **REPORT_GENERATION_FAILED**: Report generation error
- **DATA_NOT_AVAILABLE**: Requested data not available

### Error Handling Best Practices

1. **Always check for errors** in the response
2. **Use error codes** to handle specific error types
3. **Provide meaningful error messages** to users
4. **Log errors** for debugging purposes

```javascript
// Example error handling in JavaScript
const { data, errors } = await client.query({
  query: GET_ORDERS,
  variables: { userId: "user123" }
});

if (errors) {
  errors.forEach(error => {
    if (error.extensions?.code === 'NOT_FOUND') {
      console.log('User has no orders');
    } else {
      console.error('GraphQL error:', error.message);
    }
  });
}
```

---

## Best Practices

### Query Optimization

#### 1. Request Only Required Fields
```graphql
# Good - only request needed fields
query {
  orders(userId: "user123") {
    id
    total
    status
  }
}

# Avoid - requesting unnecessary fields
query {
  orders(userId: "user123") {
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

#### 2. Use Variables for Dynamic Queries
```graphql
# Good - using variables
query GetOrders($userId: String!, $limit: Int = 10) {
  orders(userId: $userId) {
    id
    total
    status
  }
}

# Avoid - hardcoded values
query {
  orders(userId: "user123") {
    id
    total
    status
  }
}
```

#### 3. Batch Related Queries
```graphql
# Good - batch related data
query UserDashboard($userId: String!) {
  userStatistics(userId: $userId) {
    totalOrders
    totalSpent
  }
  orders(userId: $userId) {
    id
    status
    total
  }
  cart(userId: $userId) {
    total
    items {
      productName
      quantity
    }
  }
}
```

### Security Considerations

1. **Validate input parameters**
2. **Implement rate limiting**
3. **Use query depth limiting**
4. **Sanitize user inputs**
5. **Implement proper authentication**

### Performance Tips

1. **Use query analysis tools**
2. **Implement caching strategies**
3. **Monitor query performance**
4. **Use DataLoader for N+1 problem**
5. **Optimize database queries**

---

*Documentación GraphQL completa para Práctica 5 - Software Avanzado 2025*