# Práctica 2 - Sistema de Autenticación y Autorización

**Curso:** Software Avanzado  
**Estudiante:** Evelyn Astrid Trabanino Lopez  
**Carné:** 202010856  
**Sección:** B  

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Instrucciones de Instalación](#instrucciones-de-instalación)
5. [Documentación Técnica](#documentación-técnica)
6. [API Endpoints](#api-endpoints)
7. [Características Implementadas](#características-implementadas)
8. [Diagramas](#diagramas)

## 🎯 Descripción del Proyecto

Sistema completo de autenticación y autorización que implementa registro de usuarios, login seguro con JWT, autenticación de dos factores (2FA) con Google Authenticator, verificación por email y login social con Google OAuth. El sistema sigue las mejores prácticas de seguridad incluyendo encriptación AES para datos sensibles, cookies HTTP-Only para tokens y protección contra ataques de fuerza bruta.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │  HTTPS  │                 │         │                 │
│    Frontend     │◄────────►│     Backend     │◄────────►│   PostgreSQL    │
│    (Vue 3)      │         │  (Express/TS)   │         │    Database     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                            
        │                           │                            
        ▼                           ▼                            
  [Cookies HTTP-Only]         [JWT + 2FA]                       
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js + Express + TypeScript**
  - ✅ **Ventajas:** Type safety, ecosistema robusto, alta performance
  - ❌ **Desventajas:** Single-threaded, requiere configuración TypeScript
  
- **PostgreSQL + Prisma ORM**
  - ✅ **Ventajas:** ACID compliance, relaciones complejas, type-safe con Prisma
  - ❌ **Desventajas:** Más overhead para aplicaciones simples

- **JWT (JSON Web Tokens)**
  - ✅ **Ventajas:** Stateless, escalable, información embebida
  - ❌ **Desventajas:** No revocable fácilmente, tamaño mayor que session IDs

### Frontend
- **Vue 3 + Vite + TypeScript**
  - ✅ **Ventajas:** Reactivo, componentes reutilizables, build rápido con Vite
  - ❌ **Desventajas:** Curva de aprendizaje, ecosistema más pequeño que React

### Servicios Adicionales
- **Google OAuth 2.0** - Autenticación social
- **Google Authenticator** - 2FA con TOTP
- **Nodemailer + Gmail SMTP** - Envío de emails

## 📦 Instrucciones de Instalación

### Prerrequisitos
- Node.js v18+
- PostgreSQL 14+
- npm o yarn
- Cuenta de Google (para OAuth y SMTP)

### Backend Setup

```bash
# Navegar al directorio backend
cd P2/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Configurar base de datos
createdb auth_system

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar servidor de desarrollo
npm run dev
```

### Frontend Setup

```bash
# Navegar al directorio frontend
cd P2/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con URL del backend

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno Requeridas

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_system"

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_GRACE_PERIOD=1d

# Encryption
AES_SECRET_KEY=your-32-character-aes-secret-key!!

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
```

## 📚 Documentación Técnica

### 1. Algoritmos de Encriptación

#### Encriptación Simétrica
Utiliza la **misma clave** para encriptar y desencriptar datos. Es rápida y eficiente para grandes volúmenes de datos.
- **Ejemplo:** AES, DES, 3DES
- **Uso en el proyecto:** Encriptación de datos sensibles en la base de datos

#### Encriptación Asimétrica
Utiliza un **par de claves** (pública y privada). La clave pública encripta y la privada desencripta.
- **Ejemplo:** RSA, ECC, DSA
- **Uso común:** HTTPS, firma digital, intercambio de claves

### 2. Algoritmo AES (Advanced Encryption Standard)

AES es un algoritmo de encriptación simétrica que opera en bloques de 128 bits con claves de 128, 192 o 256 bits.

**Funcionamiento:**
1. **SubBytes:** Sustitución no lineal de bytes
2. **ShiftRows:** Transposición de filas
3. **MixColumns:** Transformación de columnas
4. **AddRoundKey:** XOR con clave de ronda

En este proyecto usamos **AES-256-CBC**:
- 256 bits de clave
- Modo CBC (Cipher Block Chaining)
- IV (Vector de Inicialización) aleatorio

```javascript
// Ejemplo de implementación
const algorithm = 'aes-256-cbc';
const key = Buffer.from(config.encryption.aesKey);
const iv = crypto.randomBytes(16);
```

### 3. Cookies HTTP/HTTPS

Las cookies son pequeños archivos de datos almacenados en el navegador del usuario.

#### Cookies HTTP
- Transmitidas en texto plano
- Vulnerables a interceptación
- No seguras para datos sensibles

#### Cookies HTTPS
- Transmitidas sobre conexión SSL/TLS encriptada
- Protegidas contra interceptación
- Configuración `secure: true`

**Configuración en el proyecto:**
```javascript
res.cookie('access_token', token, {
  httpOnly: true,    // No accesible via JavaScript (previene XSS)
  secure: true,      // Solo HTTPS en producción
  sameSite: 'strict', // Protección CSRF
  maxAge: 15 * 60 * 1000 // 15 minutos
});
```

### 4. JWT (JSON Web Tokens)

JWT es un estándar abierto (RFC 7519) para transmitir información de forma segura entre partes como un objeto JSON.

**Estructura:**
```
header.payload.signature
```

- **Header:** Tipo de token y algoritmo de firma
- **Payload:** Claims (datos del usuario)
- **Signature:** Verificación de integridad

**Ventajas para autenticación:**
- Stateless (no requiere sesiones en servidor)
- Auto-contenido (incluye toda la información necesaria)
- Escalable horizontalmente
- Cross-domain / CORS friendly

**Implementación en el proyecto:**
```javascript
// Generación
const token = jwt.sign(payload, secret, { expiresIn: '15m' });

// Verificación
const decoded = jwt.verify(token, secret);
```

### 5. Sistema de 2FA con Google Authenticator

Implementación de TOTP (Time-based One-Time Password) compatible con Google Authenticator:

- **Algoritmo:** HMAC-SHA1
- **Período:** 30 segundos
- **Dígitos:** 6
- **Window:** 1 (permite desincronización de ±30 segundos)

## 🔐 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de nuevo usuario |
| GET | `/api/auth/verify-email` | Verificación de email |
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/verify-2fa` | Verificación código 2FA |
| POST | `/api/auth/setup-2fa` | Configurar Google Authenticator |
| POST | `/api/auth/confirm-2fa` | Confirmar activación 2FA |
| POST | `/api/auth/refresh` | Renovar token de acceso |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/auth/google` | Login con Google OAuth |
| GET | `/auth/google/callback` | Callback de Google OAuth |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/profile` | Obtener perfil del usuario |
| PUT | `/api/users/profile` | Actualizar perfil |
| POST | `/api/users/change-password` | Cambiar contraseña |
| DELETE | `/api/users/2fa` | Deshabilitar 2FA |

## ✅ Características Implementadas

### Seguridad
- ✅ **Encriptación AES-256** para datos sensibles
- ✅ **Bcrypt** para hash de contraseñas (10 rounds)
- ✅ **Cookies HTTP-Only** para tokens JWT
- ✅ **HTTPS** en producción
- ✅ **Protección CSRF** con sameSite cookies
- ✅ **Rate Limiting** para prevenir fuerza bruta
- ✅ **Account Lockout** después de 5 intentos fallidos

### Autenticación
- ✅ **JWT con refresh tokens**
- ✅ **Renovación automática** con período de gracia
- ✅ **2FA con Google Authenticator**
- ✅ **Google OAuth 2.0**
- ✅ **Verificación de email** con enlaces temporales
- ✅ **Recuperación de contraseña**

### Características Adicionales
- ✅ **TypeScript** para type safety
- ✅ **Validación de datos** con express-validator
- ✅ **Logs detallados** para debugging
- ✅ **Manejo de errores** centralizado
- ✅ **Documentación API** completa
- ✅ **Scripts de utilidad** para gestión

## 📊 Diagramas

### Diagrama de Secuencia - Flujo de Autenticación JWT

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant Email

    %% Registro
    User->>Frontend: Ingresa datos de registro
    Frontend->>Backend: POST /api/auth/register
    Backend->>Database: Verificar email único
    Database-->>Backend: Email disponible
    Backend->>Backend: Hash password (bcrypt)
    Backend->>Backend: Encriptar datos (AES)
    Backend->>Database: Guardar usuario
    Backend->>Email: Enviar verificación
    Backend-->>Frontend: Usuario creado
    Frontend-->>User: Mostrar mensaje

    %% Verificación Email
    User->>Frontend: Click enlace verificación
    Frontend->>Backend: GET /api/auth/verify-email?token=xxx
    Backend->>Database: Verificar token
    Database-->>Backend: Token válido
    Backend->>Database: Actualizar isEmailVerified
    Backend-->>Frontend: Email verificado
    Frontend-->>User: Redirigir a login

    %% Login
    User->>Frontend: Ingresa credenciales
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Buscar usuario
    Database-->>Backend: Usuario encontrado
    Backend->>Backend: Verificar password
    Backend->>Backend: Verificar email confirmado
    
    alt Sin 2FA
        Backend->>Backend: Generar JWT tokens
        Backend->>Database: Guardar refresh token
        Backend->>Frontend: Set-Cookie: access_token, refresh_token
        Frontend-->>User: Dashboard
    else Con 2FA habilitado
        Backend->>Backend: Generar temp token
        Backend-->>Frontend: Requiere 2FA + tempToken
        Frontend-->>User: Solicitar código 2FA
        User->>Frontend: Ingresa código Google Auth
        Frontend->>Backend: POST /api/auth/verify-2fa
        Backend->>Database: Verificar código TOTP
        Backend->>Backend: Generar JWT tokens
        Backend->>Database: Guardar refresh token
        Backend->>Frontend: Set-Cookie: tokens
        Frontend-->>User: Dashboard
    end

    %% Acceso a recurso protegido
    User->>Frontend: Acceder a perfil
    Frontend->>Backend: GET /api/users/profile (Cookie: access_token)
    Backend->>Backend: Verificar JWT
    alt Token válido
        Backend->>Database: Obtener datos usuario
        Backend->>Backend: Desencriptar datos (AES)
        Backend-->>Frontend: Datos del perfil
        Frontend-->>User: Mostrar perfil
    else Token expirado
        Backend-->>Frontend: 401 Token expirado
        Frontend->>Backend: POST /api/auth/refresh (Cookie: refresh_token)
        Backend->>Database: Verificar refresh token
        Backend->>Backend: Generar nuevo access token
        Backend->>Frontend: Set-Cookie: new_access_token
        Frontend->>Backend: Reintentar petición original
        Backend-->>Frontend: Datos del perfil
        Frontend-->>User: Mostrar perfil
    end
```

### Diagrama de Flujo - Sistema 2FA

```mermaid
flowchart TD
    A[Usuario solicita activar 2FA] --> B[Backend genera secret TOTP]
    B --> C[Generar QR Code]
    C --> D[Usuario escanea con Google Authenticator]
    D --> E[App genera código 6 dígitos]
    E --> F[Usuario ingresa código]
    F --> G{Verificar código}
    G -->|Válido| H[2FA activado en DB]
    G -->|Inválido| I[Solicitar nuevo código]
    I --> E
    H --> J[Generar backup codes]
    J --> K[Enviar por email]
    K --> L[2FA completamente configurado]
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test
```

### Scripts Útiles

```bash
# Verificar email manualmente
npx ts-node scripts/verify-email.ts user@example.com

# Toggle 2FA
npx ts-node scripts/toggle-2fa.ts user@example.com enable/disable

# Ver base de datos
npm run prisma:studio
```

## 📈 Métricas de Seguridad

- **Tiempo de bloqueo:** 15 minutos después de 5 intentos fallidos
- **Expiración access token:** 15 minutos
- **Expiración refresh token:** 7 días
- **Período de gracia:** 1 día para renovación
- **Longitud mínima contraseña:** 8 caracteres
- **Complejidad contraseña:** Mayúsculas, minúsculas, números y símbolos
- **Expiración enlace verificación:** 24 horas
- **Expiración código 2FA:** 30 segundos

## 🚀 Despliegue en Producción

### Consideraciones de Seguridad

1. **Variables de Entorno**
   - Usar secrets manager (AWS Secrets Manager, Vault, etc.)
   - Nunca commitear .env al repositorio
   - Rotar claves regularmente

2. **HTTPS Obligatorio**
   - Certificado SSL/TLS válido
   - Redirección HTTP → HTTPS
   - HSTS headers

3. **Base de Datos**
   - Conexión SSL a PostgreSQL
   - Backups automáticos
   - Replicación para alta disponibilidad

4. **Monitoring**
   - Logs centralizados
   - Alertas de seguridad
   - Rate limiting en API Gateway

## 📝 Licencia

Este proyecto fue desarrollado como parte del curso de Software Avanzado de la Universidad de San Carlos de Guatemala.

## 👥 Contacto

**Estudiante:** Evelyn Astrid Trabanino Lopez  
**Carné:** 202010856  
**Sección:** B  
**Auxiliar:** di3gini

---

*Última actualización: 16 de Agosto de 2025*