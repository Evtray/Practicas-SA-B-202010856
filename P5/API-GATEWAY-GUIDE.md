# 🌐 API Gateway - Guía Completa de Uso

## 📋 Información General

**Base URL**: `http://localhost:3000`
**Puerto**: 3000

## 🚀 Iniciar los Servicios

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver estado de los servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🔍 Endpoints Principales

### 1️⃣ Health Check General
Verifica el estado de todos los microservicios

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2025-09-21T04:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "users": { "status": "healthy" },
    "products": { "status": "healthy" },
    "orders": { "status": "healthy" },
    "analytics": { "status": "healthy" }
  }
}
```

### 2️⃣ Gateway Information
```bash
curl http://localhost:3000/
```

## 📦 Endpoints REST por Servicio

### User Service (Puerto directo: 3001)

#### Obtener todos los usuarios
```bash
curl http://localhost:3000/api/users
```

#### Obtener usuario por ID
```bash
curl http://localhost:3000/api/users/1
```

#### Registrar nuevo usuario
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

#### Login de usuario
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure123"
  }'
```

#### Actualizar usuario
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

#### Eliminar usuario
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Product Service (Puerto directo: 8001)

#### Obtener todos los productos
```bash
curl http://localhost:3000/api/products
```

#### Obtener producto por ID
```bash
curl http://localhost:3000/api/products/1
```

#### Obtener productos por categoría
```bash
curl http://localhost:3000/api/products/category/electronics
```

#### Crear nuevo producto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "description": "High performance laptop",
    "price": 1299.99,
    "category": "electronics",
    "stock": 50
  }'
```

### Order Service (Puerto directo: 3003)

#### Health check del servicio
```bash
curl http://localhost:3000/api/orders/health
```

## 🔷 Endpoints GraphQL

### Order Service GraphQL
**Nota**: Por limitaciones del proxy, usar directamente el puerto 3003

#### GraphQL Playground
Abrir en navegador: `http://localhost:3003/graphql`

#### Queries de ejemplo:

##### Obtener todas las órdenes
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ orders { id userId status total createdAt items { productName quantity price } } }"
  }'
```

##### Obtener órdenes de un usuario
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ orders(userId: \"user1\") { id status total items { productName quantity } } }"
  }'
```

##### Obtener una orden específica
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ order(id: \"1\") { id status total items { productName quantity price } } }"
  }'
```

##### Obtener carrito de usuario
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ cart(userId: \"user1\") { id items { productName quantity price } total } }"
  }'
```

#### Mutations de ejemplo:

##### Crear nueva orden
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createOrder(userId: \"user1\", items: [{productId: \"prod1\", productName: \"Laptop\", quantity: 1, price: 999.99}]) { id status total } }"
  }'
```

##### Actualizar estado de orden
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { updateOrderStatus(id: \"1\", status: SHIPPED) { id status updatedAt } }"
  }'
```

##### Agregar al carrito
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addToCart(userId: \"user1\", item: {productId: \"prod2\", productName: \"Mouse\", quantity: 2, price: 25.99}) { id items { productName quantity } total } }"
  }'
```

##### Quitar del carrito
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { removeFromCart(userId: \"user1\", productId: \"prod2\") { id items { productName } total } }"
  }'
```

##### Checkout (convertir carrito en orden)
```bash
curl -X POST http://localhost:3003/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { checkout(userId: \"user1\") { id status total items { productName quantity } } }"
  }'
```

### Analytics Service GraphQL
**Nota**: Por limitaciones del proxy, usar directamente el puerto 3004

#### GraphQL Playground
Abrir en navegador: `http://localhost:3004/graphql`

#### REST Endpoints de Analytics (alternativa)

##### Resumen de ventas
```bash
curl http://localhost:3000/api/analytics/sales/summary
```

##### Health check
```bash
curl http://localhost:3000/api/analytics/health
```

## 📊 Verificación de Estado

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f api-gateway
docker-compose logs -f order-service
docker-compose logs -f user-service
docker-compose logs -f product-service
docker-compose logs -f analytics-service
```

### Verificar contenedores en ejecución
```bash
docker ps
```

### Verificar redes Docker
```bash
docker network ls
```

## 🛑 Solución de Problemas

### Si un servicio no responde:
1. Verificar que Docker esté ejecutándose
2. Verificar logs del servicio: `docker-compose logs [servicio]`
3. Reiniciar el servicio: `docker-compose restart [servicio]`
4. Reconstruir si es necesario: `docker-compose up -d --build [servicio]`

### Si el API Gateway no puede conectar con un servicio:
1. Verificar que todos los servicios estén saludables: `curl http://localhost:3000/health`
2. Verificar la red Docker: `docker network inspect ecommerce-microservices`
3. Reiniciar todos los servicios: `docker-compose restart`

### Para desarrollo y pruebas:
- User Service: http://localhost:3001
- Product Service: http://localhost:8001
- Order Service: http://localhost:3003
- Analytics Service: http://localhost:3004
- API Gateway: http://localhost:3000

## 🔒 Headers de Autenticación (Mock)

Para endpoints protegidos (actualmente deshabilitado en desarrollo):
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer mock-token-123"
```

## 📝 Notas Importantes

1. **GraphQL a través del Gateway**: Debido a limitaciones con WebSocket proxying, se recomienda acceder a GraphQL directamente en los puertos de los servicios (3003 para Orders, 3004 para Analytics)

2. **CORS**: Habilitado para todos los orígenes en desarrollo

3. **Rate Limiting**: Configurado a 100 requests por 15 minutos por IP

4. **Health Checks**: Cada servicio tiene su propio health check que el API Gateway monitorea

5. **Docker Network**: Todos los servicios están en la red `ecommerce-microservices` para comunicación interna

## 🚀 Comandos Útiles

```bash
# Reconstruir todo desde cero
docker-compose down
docker-compose up -d --build

# Ver uso de recursos
docker stats

# Limpiar contenedores y volúmenes
docker-compose down -v

# Ejecutar comando en contenedor
docker exec -it order-service sh

# Ver configuración de red
docker network inspect ecommerce-microservices
```