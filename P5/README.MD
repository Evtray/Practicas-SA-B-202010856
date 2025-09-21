# 🏪 E-Commerce Microservices System

**Universidad San Carlos de Guatemala**
**Facultad de Ingeniería**
**Software Avanzado - Práctica 5**
**Estudiante**: Edwin Sandoval Lopez
**Carné**: 202010856

## 📋 Descripción del Proyecto

Sistema completo de comercio electrónico construido con arquitectura de microservicios moderna, utilizando Docker para orquestación, GraphQL para servicios avanzados, y API Gateway para enrutamiento inteligente. El sistema implementa las mejores prácticas de desarrollo distribuido, incluyendo separación de responsabilidades, escalabilidad horizontal, y comunicación eficiente entre servicios.

### Características Principales

- ✅ **Arquitectura de Microservicios**: Servicios independientes y desacoplados
- ✅ **API Gateway**: Punto de entrada único con enrutamiento inteligente
- ✅ **GraphQL & REST**: Soporte para ambos paradigmas de API
- ✅ **Containerización**: Docker y Docker Compose para desarrollo y despliegue
- ✅ **Escalabilidad**: Servicios horizontalmente escalables
- ✅ **Monitoreo**: Health checks y logging integrado
- ✅ **Documentación**: APIs completamente documentadas
- ✅ **Testing**: Endpoints listos para pruebas automatizadas

## 🏗️ Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                        API Gateway (Port 3000)                  │
│                     Node.js + Express + Proxy                   │
└────────────────┬───────────────┬───────────────┬───────────────┘
                 │               │               │
                 ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  User Service   │ │   Product   │ │   Order     │ │ Analytics   │
│                 │ │   Service   │ │   Service   │ │  Service    │
│ Node.js+Express │ │Python+FastAPI│ │Node.js+Apollo│ │Python+Graphene│
│    Port 3001    │ │  Port 3002  │ │  Port 3003  │ │  Port 3004  │
│      REST       │ │    REST     │ │   GraphQL   │ │   GraphQL   │
└─────────────────┘ ┘─────────────┘ └─────────────┘ └─────────────┘
         │                   │               │               │
         ▼                   ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   In-Memory     │ │ In-Memory   │ │ In-Memory   │ │ In-Memory   │
│   User Store    │ │Product Store│ │Order & Cart │ │Analytics DB │
└─────────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### Microservicios Detallados

| Servicio | Tecnología | Puerto | Protocolo | Descripción | Endpoints Principales |
|----------|-----------|--------|-----------|-------------|----------------------|
| **User Service** | Node.js + Express | 3001 | REST | Gestión completa de usuarios, autenticación y autorización | `/api/users/*`, `/health` |
| **Product Service** | Python + FastAPI | 3002 | REST | Catálogo de productos con gestión de inventario y categorías | `/api/products/*`, `/docs` |
| **Order Service** | Node.js + Apollo | 3003 | GraphQL | Gestión avanzada de pedidos y carritos de compra | `/graphql`, `/health` |
| **Analytics Service** | Python + Graphene | 3004 | GraphQL | Análisis de ventas, reportes y estadísticas de negocio | `/graphql`, `/docs` |
| **API Gateway** | Node.js + Express | 3000 | REST/GraphQL | Enrutamiento inteligente, balanceador de carga y proxy | `/health`, `/`, `/graphql` |

## ⚡ Guía de Inicio Rápido

### Prerrequisitos del Sistema

- **Docker**: versión 24.0+ con Docker Compose v2
- **Node.js**: versión 18+ (para desarrollo local)
- **Python**: versión 3.11+ (para desarrollo local)
- **Git**: para clonar el repositorio
- **Postman/Insomnia**: para pruebas de API (opcional)

### 🚀 Instalación y Despliegue con Docker

#### Paso 1: Clonar y Preparar el Proyecto
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/Practicas-SA-B-202010856.git
cd Practicas-SA-B-202010856/P5

# Verificar estructura del proyecto
ls -la
```

#### Paso 2: Desplegar Todos los Servicios
```bash
# Construir e iniciar todos los servicios
docker-compose up --build -d

# Verificar que todos los servicios estén corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f user-service
```

#### Paso 3: Verificar el Despliegue
```bash
# Verificar API Gateway
curl http://localhost:3000/health

# Verificar todos los servicios
curl http://localhost:3001/health  # User Service
curl http://localhost:3002/health  # Product Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Analytics Service
```

### 🛠️ Desarrollo Local (Sin Docker)

#### Configuración de Servicios Node.js
```bash
# User Service
cd user-service
npm install
npm start  # Puerto 3001

# Order Service (en nueva terminal)
cd order-service
npm install
npm start  # Puerto 3003

# API Gateway (en nueva terminal)
cd api-gateway
npm install
npm start  # Puerto 3000
```

#### Configuración de Servicios Python
```bash
# Product Service (en nueva terminal)
cd product-service
pip install -r requirements.txt
python main.py  # Puerto 3002

# Analytics Service (en nueva terminal)
cd analytics-service
pip install -r requirements.txt
python main.py  # Puerto 3004
```

#### Variables de Entorno para Desarrollo
```bash
# Crear archivos .env en cada servicio según sea necesario
# user-service/.env
echo "PORT=3001" > user-service/.env
echo "NODE_ENV=development" >> user-service/.env

# product-service/.env
echo "PORT=3002" > product-service/.env
echo "ENVIRONMENT=development" >> product-service/.env
```

## 📍 Endpoints y APIs Disponibles

### 🌐 API Gateway (http://localhost:3000)

| Endpoint | Método | Descripción | Destino |
|----------|--------|-------------|---------|
| `/health` | GET | Estado completo del sistema | Gateway |
| `/` | GET | Información del gateway | Gateway |
| `/api/users/*` | ALL | Proxy a User Service | User Service |
| `/api/products/*` | ALL | Proxy a Product Service | Product Service |
| `/orders/graphql` | POST | GraphQL para pedidos | Order Service |
| `/analytics/graphql` | POST | GraphQL para analytics | Analytics Service |
| `/graphql` | POST | GraphQL unificado (auto-routing) | Multiple Services |

### 👤 User Service REST API (http://localhost:3001)

| Endpoint | Método | Descripción | Body/Params |
|----------|--------|-------------|-------------|
| `/health` | GET | Estado del servicio | - |
| `/api/users` | GET | Listar todos los usuarios | - |
| `/api/users/:id` | GET | Obtener usuario por ID | - |
| `/api/users/register` | POST | Registrar nuevo usuario | `{email, password, name}` |
| `/api/users/login` | POST | Autenticar usuario | `{email, password}` |
| `/api/users/:id` | PUT | Actualizar usuario | `{name?, email?, role?}` |
| `/api/users/:id` | DELETE | Eliminar usuario | - |

### 🛍️ Product Service REST API (http://localhost:3002)

| Endpoint | Método | Descripción | Query Params/Body |
|----------|--------|-------------|-------------------|
| `/health` | GET | Estado del servicio | - |
| `/docs` | GET | Documentación Swagger | - |
| `/api/products` | GET | Listar productos | `?skip=0&limit=100&category=Electronics` |
| `/api/products/:id` | GET | Obtener producto por ID | - |
| `/api/products` | POST | Crear nuevo producto | `{name, description, price, category, stock}` |
| `/api/products/:id` | PUT | Actualizar producto | `{name?, description?, price?, stock?}` |
| `/api/products/:id` | DELETE | Eliminar producto | - |
| `/api/products/category/:category` | GET | Productos por categoría | - |
| `/api/products/:id/stock` | PATCH | Actualizar stock | `?quantity=N` |

### 🛒 Order Service GraphQL (http://localhost:3003/graphql)

#### Queries Disponibles
```graphql
# Obtener pedidos de un usuario
orders(userId: String): [Order!]!

# Obtener pedido específico
order(id: ID!): Order

# Obtener carrito de usuario
cart(userId: String!): Cart
```

#### Mutations Disponibles
```graphql
# Crear nuevo pedido
createOrder(userId: String!, items: [OrderItemInput!]!): Order!

# Actualizar estado de pedido
updateOrderStatus(id: ID!, status: OrderStatus!): Order

# Agregar al carrito
addToCart(userId: String!, item: CartItemInput!): Cart!

# Remover del carrito
removeFromCart(userId: String!, productId: String!): Cart!

# Procesar checkout
checkout(userId: String!): Order!
```

### 📊 Analytics Service GraphQL (http://localhost:3004/graphql)

#### Queries de Análisis
```graphql
# Reporte de ventas por período
salesReport(startDate: String, endDate: String): SalesReport

# Todos los reportes de ventas
salesReports: [SalesReport]

# Productos más vendidos
topProducts(limit: Int = 10): [ProductStats]

# Estadísticas de usuario específico
userStatistics(userId: String): UserStatistics

# Estadísticas de todos los usuarios
allUserStatistics: [UserStatistics]

# Ingresos por categoría
revenueByCategory: [CategoryRevenue]
```

#### Mutations de Reportes
```graphql
# Generar nuevo reporte
generateReport(
  reportType: String!
  startDate: String
  endDate: String
  params: String
): ReportGenerationResult
```

## 🐳 Gestión con Docker

### Comandos de Construcción y Despliegue
```bash
# Construir todas las imágenes desde cero
docker-compose build --no-cache

# Construir e iniciar servicios
docker-compose up --build -d

# Construir servicio específico
docker-compose build user-service

# Reconstruir y reiniciar servicio específico
docker-compose up --build -d user-service
```

### Comandos de Gestión y Monitoreo
```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de servicio específico
docker-compose logs -f user-service

# Ejecutar comando en contenedor
docker-compose exec user-service bash

# Ver estadísticas de recursos
docker stats
```

### Comandos de Limpieza y Mantenimiento
```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar servicio específico
docker-compose restart user-service

# Escalar horizontalmente un servicio
docker-compose up -d --scale product-service=3

# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar sistema completo
docker system prune -af
```

### Comandos de Debugging
```bash
# Inspeccionar contenedor
docker-compose exec user-service env

# Ver configuración del compose
docker-compose config

# Seguir logs con timestamps
docker-compose logs -f -t user-service
```

## 🧪 Testing y Validación

### Suite de Pruebas Completa

#### 1. Verificación de Servicios
```bash
# Script de verificación rápida
#!/bin/bash
echo "🔍 Verificando servicios..."

# API Gateway
echo "Gateway:" && curl -s http://localhost:3000/health | jq '.status'

# User Service
echo "Users:" && curl -s http://localhost:3001/health | jq '.status'

# Product Service
echo "Products:" && curl -s http://localhost:3002/health | jq '.status'

# Order Service
echo "Orders:" && curl -s http://localhost:3003/health | jq '.status'

# Analytics Service
echo "Analytics:" && curl -s http://localhost:3004/health | jq '.status'
```

#### 2. Pruebas de API REST
```bash
# === USER SERVICE TESTS ===
# Registrar nuevo usuario
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "securepassword123",
    "name": "Test User"
  }'

# Login de usuario
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Listar usuarios
curl http://localhost:3001/api/users

# === PRODUCT SERVICE TESTS ===
# Listar productos
curl http://localhost:3002/api/products

# Crear nuevo producto
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product for demonstration",
    "price": 99.99,
    "category": "Electronics",
    "stock": 50
  }'

# Filtrar productos por categoría
curl "http://localhost:3002/api/products?category=Electronics&limit=5"
```

#### 3. Pruebas de GraphQL
```bash
# === ORDER SERVICE GRAPHQL ===
# Obtener pedidos de usuario
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { orders(userId: \"user1\") { id status total items { productName quantity price } createdAt } }"
  }'

# Agregar producto al carrito
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addToCart(userId: \"user1\", item: { productId: \"prod1\", productName: \"Laptop\", quantity: 1, price: 1299.99 }) { total items { productName quantity } } }"
  }'

# === ANALYTICS SERVICE GRAPHQL ===
# Obtener reportes de ventas
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { salesReports { id period totalRevenue totalOrders averageOrderValue } }"
  }'

# Productos más vendidos
curl -X POST http://localhost:3004/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { topProducts(limit: 5) { productName totalRevenue totalSold conversionRate } }"
  }'
```

#### 4. Pruebas a través del API Gateway
```bash
# Todas las pruebas anteriores también funcionan a través del gateway
# Solo cambiar el puerto de 3001/3002/3003/3004 a 3000

# Usuario a través del gateway
curl http://localhost:3000/api/users

# Productos a través del gateway
curl http://localhost:3000/api/products

# GraphQL de pedidos a través del gateway
curl -X POST http://localhost:3000/orders/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { orders(userId: \"user1\") { id status total } }"}'

# GraphQL unificado (auto-routing)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { topProducts(limit: 3) { productName totalRevenue } }"}'
```

### 📋 Colecciones de Postman

Puedes encontrar colecciones completas de Postman en:
- `docs/POSTMAN_EXAMPLES.md` - Ejemplos detallados con curl y Postman
- Importa las colecciones JSON para pruebas automatizadas

### 🎯 Test Scenarios Recomendados

1. **Flujo Completo de Usuario**:
   - Registro → Login → Ver productos → Agregar al carrito → Checkout

2. **Gestión de Productos**:
   - Crear → Listar → Actualizar → Gestionar stock

3. **Análisis de Datos**:
   - Generar reportes → Ver estadísticas → Analizar rendimiento

4. **Pruebas de Carga**:
   - Múltiples usuarios concurrentes
   - Escalabilidad de servicios

## 📚 Documentación Completa

### 📖 Documentación Principal

| Documento | Descripción | Ubicación |
|-----------|-------------|----------|
| **API Contracts** | Contratos completos de REST y GraphQL | [docs/API_CONTRACTS.md](./docs/API_CONTRACTS.md) |
| **GraphQL Documentation** | Esquemas y ejemplos GraphQL detallados | [docs/GRAPHQL_DOCUMENTATION.md](./docs/GRAPHQL_DOCUMENTATION.md) |
| **Postman Examples** | Colección de ejemplos para testing | [docs/POSTMAN_EXAMPLES.md](./docs/POSTMAN_EXAMPLES.md) |
| **Project Design** | Diseño y arquitectura del sistema | [PROJECT_DESIGN.md](./PROJECT_DESIGN.md) |
| **Roadmap** | Plan de desarrollo y mejoras | [ROADMAP.md](./ROADMAP.md) |

### 🌐 Documentación Interactiva

| Servicio | Tipo | URL | Descripción |
|----------|------|-----|-------------|
| **Product Service** | Swagger/OpenAPI | http://localhost:3002/docs | Documentación REST interactiva |
| **Product Service** | ReDoc | http://localhost:3002/redoc | Documentación REST alternativa |
| **Order Service** | GraphQL Playground | http://localhost:3003/graphql | IDE GraphQL para pedidos |
| **Analytics Service** | GraphQL Endpoint | http://localhost:3004/graphql | API GraphQL para analytics |
| **API Gateway** | Unified GraphQL | http://localhost:3000/graphql | GraphQL unificado |

### 🔍 Enlaces Rápidos de Documentación

```bash
# Abrir documentaciones en el navegador (macOS)
open http://localhost:3002/docs        # FastAPI Swagger
open http://localhost:3003/graphql     # GraphQL Playground
open http://localhost:3000/            # Gateway Info

# Verificar endpoints de documentación
curl http://localhost:3002/docs        # Swagger UI
curl http://localhost:3004/graphql     # GraphQL Schema
```

## 🔧 Guía de Desarrollo

### 🔐 Configuración de Variables de Entorno

Cada servicio puede configurarse mediante variables de entorno:

```env
# user-service/.env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
DB_URI=postgresql://user:pass@localhost/users  # Para BD real

# product-service/.env
PORT=3002
HOST=0.0.0.0
ENVIRONMENT=development
MONGODB_URI=mongodb://localhost:27017/products  # Para BD real

# order-service/.env
PORT=3003
NODE_ENV=development
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002

# analytics-service/.env
PORT=3004
HOST=0.0.0.0
ENVIRONMENT=development
USER_SERVICE_URL=http://localhost:3001
ORDER_SERVICE_URL=http://localhost:3003
PRODUCT_SERVICE_URL=http://localhost:3002

# api-gateway/.env
PORT=3000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
ANALYTICS_SERVICE_URL=http://localhost:3004
```

### 📁 Estructura Detallada del Proyecto

```
P5/                                    # Directorio principal del proyecto
├── 📁 api-gateway/                    # API Gateway - Punto de entrada único
│   ├── index.js                      # Servidor principal con proxy inteligente
│   ├── package.json                  # Dependencias Node.js
│   └── Dockerfile                    # Imagen Docker del gateway
├── 📁 user-service/                   # Servicio de Usuarios (REST)
│   ├── index.js                      # API REST para gestión de usuarios
│   ├── package.json                  # Dependencias Node.js
│   └── Dockerfile                    # Imagen Docker del servicio
├── 📁 product-service/                # Servicio de Productos (REST)
│   ├── main.py                       # API FastAPI para catálogo
│   ├── requirements.txt              # Dependencias Python
│   └── Dockerfile                    # Imagen Docker del servicio
├── 📁 order-service/                  # Servicio de Pedidos (GraphQL)
│   ├── index.js                      # Servidor Apollo GraphQL
│   ├── package.json                  # Dependencias Node.js
│   └── Dockerfile                    # Imagen Docker del servicio
├── 📁 analytics-service/              # Servicio de Análisis (GraphQL)
│   ├── main.py                       # API Graphene para analytics
│   ├── requirements.txt              # Dependencias Python
│   └── Dockerfile                    # Imagen Docker del servicio
├── 📁 docs/                          # 📚 Documentación Completa
│   ├── API_CONTRACTS.md              # Contratos de todas las APIs
│   ├── GRAPHQL_DOCUMENTATION.md      # Documentación GraphQL detallada
│   └── POSTMAN_EXAMPLES.md           # Ejemplos y colecciones de pruebas
├── 📄 docker-compose.yml             # Orquestación de todos los servicios
├── 📄 README.md                      # 📖 Esta documentación
├── 📄 PROJECT_DESIGN.md              # Diseño y arquitectura del sistema
├── 📄 ROADMAP.md                     # Roadmap de desarrollo
└── 📄 .gitignore                     # Archivos ignorados por Git
```

### 🛠️ Herramientas de Desarrollo Recomendadas

#### IDEs y Editores
- **Visual Studio Code** con extensiones:
  - GraphQL
  - Docker
  - REST Client
  - Python
  - Node.js

#### Herramientas de Testing
- **Postman/Insomnia**: Para testing de APIs
- **GraphQL Playground**: Para testing GraphQL
- **curl**: Para pruebas rápidas desde terminal

#### Monitoreo y Debugging
- **Docker Desktop**: Para gestión visual de contenedores
- **Logs**: `docker-compose logs -f`
- **Health Checks**: Endpoints `/health` en todos los servicios

### 🚀 Workflow de Desarrollo

1. **Desarrollo Local**:
   ```bash
   # Iniciar servicios individuales para desarrollo
   cd user-service && npm run dev
   cd product-service && python main.py
   ```

2. **Testing con Docker**:
   ```bash
   # Construir y probar cambios
   docker-compose up --build
   ```

3. **Debugging**:
   ```bash
   # Ver logs específicos
   docker-compose logs -f user-service
   ```

## 🔧 Solución de Problemas (Troubleshooting)

### Problemas Comunes y Soluciones

#### 🐳 Problemas con Docker

**Error: Puerto ya en uso**
```bash
# Verificar qué está usando el puerto
lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 <PID>

# O cambiar puertos en docker-compose.yml
```

**Error: Servicios no pueden comunicarse**
```bash
# Verificar red de Docker
docker network ls
docker network inspect p5_default

# Reiniciar servicios
docker-compose down && docker-compose up
```

**Error: Falta de memoria/recursos**
```bash
# Limpiar recursos Docker
docker system prune -af
docker volume prune -f
```

#### 🌐 Problemas de API

**Error 502 Bad Gateway**
- Verificar que todos los servicios estén corriendo
- Revisar logs: `docker-compose logs gateway`
- Verificar URLs de servicios en variables de entorno

**Error de CORS**
- Verificar configuración CORS en cada servicio
- Para desarrollo, usar `allow_origins=["*"]`

**Error de GraphQL**
- Verificar sintaxis de query en GraphQL Playground
- Revisar logs del servicio específico

#### 📊 Problemas de Desarrollo

**Dependencias faltantes**
```bash
# Node.js
npm install

# Python
pip install -r requirements.txt
```

**Variables de entorno**
- Verificar archivos `.env` en cada servicio
- Usar valores por defecto si no están definidas

### 📋 Checklist de Verificación

- [ ] Todos los servicios responden en `/health`
- [ ] API Gateway puede acceder a todos los servicios
- [ ] GraphQL Playground funciona correctamente
- [ ] Documentación Swagger está disponible
- [ ] Logs no muestran errores críticos
- [ ] Puertos están disponibles y correctos

## ✅ Cumplimiento de Requisitos (Rubric)

### Criterios de Evaluación Cubiertos

#### 🏗️ Arquitectura de Microservicios (25%)
- ✅ **Separación de servicios**: 4 microservicios independientes
- ✅ **Comunicación**: REST y GraphQL implementados
- ✅ **API Gateway**: Enrutamiento inteligente y proxy
- ✅ **Escalabilidad**: Servicios horizontalmente escalables

#### 🐳 Containerización y Docker (25%)
- ✅ **Dockerfiles**: Cada servicio tiene su Dockerfile optimizado
- ✅ **Docker Compose**: Orquestación completa del sistema
- ✅ **Redes**: Comunicación entre contenedores
- ✅ **Variables de entorno**: Configuración flexible

#### 🔌 APIs y Documentación (25%)
- ✅ **REST APIs**: User Service y Product Service completamente funcionales
- ✅ **GraphQL**: Order Service y Analytics Service con esquemas completos
- ✅ **Documentación**: APIs completamente documentadas
- ✅ **Testing**: Ejemplos y colecciones de pruebas

#### 💻 Implementación y Calidad (25%)
- ✅ **Código limpio**: Estructura organizada y comentada
- ✅ **Error handling**: Manejo consistente de errores
- ✅ **Logging**: Sistema de logs implementado
- ✅ **Health checks**: Monitoreo de estado de servicios