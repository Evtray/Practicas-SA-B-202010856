# 🚀 ROADMAP - Práctica 5: Microservicios y Docker

## 📋 Resumen del Proyecto
Implementación de una arquitectura de microservicios dockerizada con mínimo 4 servicios, API Gateway, y GraphQL.

## 🎯 Requisitos Principales
- ✅ Mínimo 4 microservicios
- ✅ Docker para cada servicio
- ✅ API Gateway simulador
- ✅ 2 microservicios con GraphQL
- ✅ 2 lenguajes de programación diferentes
- ✅ Comunicación entre contenedores

---

## 📅 FASE 1: Diseño y Planificación (2-3 horas)
- [ ] Definir temática del proyecto
- [ ] Diseñar arquitectura de 4 microservicios
- [ ] Definir contratos y APIs de cada servicio
- [ ] Crear diagrama de arquitectura
- [ ] Diseñar base de datos y crear diagrama ER
- [ ] Seleccionar stack tecnológico

## 🛠️ FASE 2: Setup Inicial (1 hora)
- [ ] Crear estructura de carpetas
- [ ] Inicializar proyectos (Node.js/Python)
- [ ] Configurar .gitignore
- [ ] Crear README base

### Estructura de Carpetas:
```
P5/
├── api-gateway/
├── microservice-1/
├── microservice-2/
├── microservice-3/
├── microservice-4/
├── docker-compose.yml
├── docs/
│   ├── architecture.png
│   └── database-er.png
└── README.md
```

## ⚡ FASE 3: Microservicios REST (3 horas)
- [ ] **MS1 (Node.js/Express)**: Implementar endpoints REST
- [ ] **MS2 (Python/FastAPI)**: Implementar endpoints REST
- [ ] Testing básico con Postman
- [ ] Documentar contratos REST

## 📊 FASE 4: Microservicios GraphQL (3 horas)
- [ ] **MS3**: Setup Apollo Server (Node.js)
- [ ] **MS3**: Implementar schemas y resolvers
- [ ] **MS4**: Setup Graphene (Python)
- [ ] **MS4**: Implementar schemas y resolvers
- [ ] Testing con GraphQL Playground

## 🔌 FASE 5: API Gateway (1 hora)
- [ ] Crear servicio con Express.js
- [ ] Configurar http-proxy-middleware
- [ ] Implementar routing centralizado
- [ ] Agregar middleware básico

## 🐳 FASE 6: Dockerización (2 horas)
- [ ] Crear Dockerfile para cada servicio
- [ ] Optimizar con multi-stage builds
- [ ] Crear docker-compose.yml
- [ ] Configurar red interna
- [ ] Testing de comunicación

### Dockerfile Optimizado (Ejemplo):
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

## 📝 FASE 7: Documentación (1 hora)
- [ ] Documentar contratos de microservicios
- [ ] Crear documentación GraphQL completa
- [ ] Actualizar README principal
- [ ] Agregar ejemplos de uso (curl/Postman)

## ✅ FASE 8: Testing y Validación Final (30 min)
- [ ] Probar todos los endpoints
- [ ] Validar comunicación entre servicios
- [ ] Verificar `docker-compose up`
- [ ] Revisar cumplimiento de rúbrica

## 📦 FASE 9: Entrega
- [ ] Revisar rúbrica (100 puntos)
- [ ] Agregar auxiliar al repo (di3gini - Developer)
- [ ] Push final
- [ ] Entregar enlace en UEDI

---

## 🔧 Stack Tecnológico Sugerido

### Lenguajes:
- **Node.js 18+** (MS1, MS3, API Gateway)
- **Python 3.11+** (MS2, MS4)

### Frameworks:
- **REST**: Express.js, FastAPI
- **GraphQL**: Apollo Server, Graphene
- **API Gateway**: Express + http-proxy-middleware

### Base de Datos:
- PostgreSQL o MongoDB (según el caso de uso)

### Docker:
- Docker 24+
- Docker Compose v2

---

## ⏰ Cronograma Estimado
| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| Fase 1: Diseño | 2-3h | Alta |
| Fase 2: Setup | 1h | Alta |
| Fase 3: REST | 3h | Alta |
| Fase 4: GraphQL | 3h | Alta |
| Fase 5: Gateway | 1h | Media |
| Fase 6: Docker | 2h | Alta |
| Fase 7: Docs | 1h | Media |
| Fase 8: Testing | 30min | Alta |
| Fase 9: Entrega | 30min | Alta |

**Total: 12-14 horas**

---

## 📊 Rúbrica de Evaluación

### Documentación (30 pts):
- Contratos de Microservicios: 10 pts
- Dockerfiles optimizados: 5 pts
- Diagrama de Arquitectura: 5 pts
- Diagrama ER: 5 pts
- Documentación GraphQL: 5 pts

### Aplicación (60 pts):
- Endpoints MS1: 10 pts
- Endpoints MS2: 10 pts
- Endpoints MS3 (GraphQL): 10 pts
- Endpoints MS4 (GraphQL): 10 pts
- Arquitectura correcta: 5 pts
- API Gateway: 5 pts
- Comunicación Docker: 10 pts

### Preguntas (10 pts):
- Pregunta 1: 5 pts
- Pregunta 2: 5 pts

**TOTAL: 100 puntos**