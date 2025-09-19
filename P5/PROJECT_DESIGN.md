# 🏪 Sistema de E-Commerce con Microservicios

## 📋 Descripción del Proyecto
Sistema de comercio electrónico modular implementado con arquitectura de microservicios, permitiendo gestión de usuarios, productos, pedidos y análisis de ventas.

## 🎯 Arquitectura de Microservicios

### 1️⃣ **User Service** (Node.js + Express)
**Responsabilidad:** Gestión de usuarios y autenticación
- **Puerto:** 3001
- **Base de datos:** PostgreSQL
- **Endpoints REST:**
  - `POST /api/users/register` - Registro de usuarios
  - `POST /api/users/login` - Autenticación
  - `GET /api/users/:id` - Obtener usuario
  - `PUT /api/users/:id` - Actualizar usuario
  - `DELETE /api/users/:id` - Eliminar usuario

### 2️⃣ **Product Service** (Python + FastAPI)
**Responsabilidad:** Gestión de catálogo de productos
- **Puerto:** 3002
- **Base de datos:** MongoDB
- **Endpoints REST:**
  - `GET /api/products` - Listar productos
  - `GET /api/products/:id` - Detalle de producto
  - `POST /api/products` - Crear producto
  - `PUT /api/products/:id` - Actualizar producto
  - `DELETE /api/products/:id` - Eliminar producto
  - `GET /api/products/search` - Buscar productos

### 3️⃣ **Order Service** (Node.js + Apollo Server GraphQL)
**Responsabilidad:** Gestión de pedidos y carrito de compras
- **Puerto:** 3003
- **Base de datos:** PostgreSQL
- **GraphQL Queries:**
  - `orders(userId: ID!)` - Pedidos de un usuario
  - `order(id: ID!)` - Detalle de pedido
  - `cart(userId: ID!)` - Carrito actual
- **GraphQL Mutations:**
  - `createOrder(input: OrderInput!)` - Crear pedido
  - `updateOrderStatus(id: ID!, status: String!)` - Actualizar estado
  - `addToCart(userId: ID!, productId: ID!, quantity: Int!)` - Agregar al carrito
  - `removeFromCart(userId: ID!, productId: ID!)` - Quitar del carrito
  - `checkout(userId: ID!)` - Procesar compra

### 4️⃣ **Analytics Service** (Python + Graphene GraphQL)
**Responsabilidad:** Análisis y reportes de ventas
- **Puerto:** 3004
- **Base de datos:** MongoDB (datos agregados)
- **GraphQL Queries:**
  - `salesReport(startDate: String!, endDate: String!)` - Reporte de ventas
  - `topProducts(limit: Int)` - Productos más vendidos
  - `userStatistics(userId: ID!)` - Estadísticas de usuario
  - `revenueByCategory` - Ingresos por categoría
- **GraphQL Mutations:**
  - `generateReport(type: String!, params: JSON!)` - Generar reporte

### 🌐 **API Gateway** (Node.js + Express)
**Responsabilidad:** Punto de entrada único, routing y autenticación
- **Puerto:** 3000
- **Funcionalidades:**
  - Proxy reverso a microservicios
  - Autenticación JWT centralizada
  - Rate limiting
  - Logging de requests
  - CORS handling

## 🗄️ Modelo de Datos

### User Service (PostgreSQL)
```sql
users
├── id (UUID)
├── email (VARCHAR)
├── password_hash (VARCHAR)
├── name (VARCHAR)
├── role (ENUM: customer, admin)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

user_profiles
├── id (UUID)
├── user_id (FK)
├── phone (VARCHAR)
├── address (JSON)
└── preferences (JSON)
```

### Product Service (MongoDB)
```javascript
products {
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  specifications: Object,
  created_at: Date,
  updated_at: Date
}
```

### Order Service (PostgreSQL)
```sql
orders
├── id (UUID)
├── user_id (UUID)
├── total_amount (DECIMAL)
├── status (ENUM: pending, processing, shipped, delivered)
├── shipping_address (JSON)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

order_items
├── id (UUID)
├── order_id (FK)
├── product_id (VARCHAR)
├── quantity (INT)
├── unit_price (DECIMAL)
└── subtotal (DECIMAL)

cart_items
├── id (UUID)
├── user_id (UUID)
├── product_id (VARCHAR)
├── quantity (INT)
└── added_at (TIMESTAMP)
```

### Analytics Service (MongoDB)
```javascript
analytics_events {
  _id: ObjectId,
  event_type: String, // purchase, view, cart_add
  user_id: String,
  product_id: String,
  order_id: String,
  amount: Number,
  metadata: Object,
  timestamp: Date
}

daily_summaries {
  _id: ObjectId,
  date: Date,
  total_sales: Number,
  total_orders: Number,
  top_products: Array,
  revenue_by_category: Object
}
```

## 🔗 Comunicación entre Servicios

### Sincrónica (HTTP/GraphQL):
- API Gateway → Todos los servicios
- Order Service → User Service (validar usuario)
- Order Service → Product Service (verificar stock)

### Eventos (Future implementation):
- Order Service → Analytics Service (evento de compra)
- Product Service → Analytics Service (evento de visualización)

## 🛡️ Seguridad

### Autenticación:
- JWT tokens generados por User Service
- Validación en API Gateway
- Propagación de headers a microservicios

### Autorización:
- Role-based access control (RBAC)
- Admin endpoints protegidos
- Validación de ownership en recursos

## 📦 Tecnologías

### Backend:
- **Node.js 18**: User Service, Order Service, API Gateway
- **Python 3.11**: Product Service, Analytics Service
- **Express.js**: REST APIs
- **FastAPI**: Python REST API
- **Apollo Server**: GraphQL (Node.js)
- **Graphene**: GraphQL (Python)

### Bases de Datos:
- **PostgreSQL 15**: Datos transaccionales
- **MongoDB 6**: Datos no estructurados

### DevOps:
- **Docker**: Containerización
- **Docker Compose**: Orquestación local
- **nginx**: Load balancer (opcional)