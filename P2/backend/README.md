  # Authentication System API Documentation

  ## 📋 Descripción
  Sistema de autenticación completo con JWT, 2FA y verificación de email construido con Node.js, Express, TypeScript y PostgreSQL.

  ## 🚀 Instalación y Configuración

  ### Prerequisitos
  - Node.js v18 o superior
  - PostgreSQL 14 o superior
  - npm o yarn

  ### Pasos de Instalación

  1. **Clonar el repositorio**
  ```bash
  git clone <repository-url>
  cd P2/backend
  ```

  2. **Instalar dependencias**
  ```bash
  npm install
  ```

  3. **Configurar variables de entorno**
  ```bash
  cp .env.example .env
  # Editar .env con tus configuraciones
  ```

  4. **Configurar la base de datos PostgreSQL**
  ```bash
  # Crear la base de datos
  createdb auth_system

  # Generar el cliente de Prisma
  npm run prisma:generate

  # Ejecutar las migraciones
  npm run prisma:migrate
  ```

  5. **Iniciar el servidor**
  ```bash
  # Modo desarrollo
  npm run dev

  # Modo producción
  npm run build
  npm start
  ```

  ## 📚 API Endpoints

  ### Base URL
  ```
  http://localhost:3000
  ```

  ### Rutas Disponibles
  - **Autenticación**: `http://localhost:3000/auth/*`
  - **Usuarios**: `http://localhost:3000/users/*`
  - **Google OAuth**: `http://localhost:3000/auth/google`

  ### 🔐 Autenticación

  #### 1. Registro de Usuario
  ```http
  POST /auth/register
  Content-Type: application/json

  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecurePassword123!"
  }
  ```

  **Respuesta exitosa (201):**
  ```json
  {
    "message": "Usuario registrado exitosamente. Por favor verifica tu email.",
    "userId": "uuid-here"
  }
  ```

  #### 2. Verificación de Email
  ```http
  GET /auth/verify-email?token=verification-token-here
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Email verificado exitosamente"
  }
  ```

  #### 3. Login
  ```http
  POST /auth/login
  Content-Type: application/json

  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Login exitoso",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "has2FA": false
    },
    "requiresTwoFactor": false
  }
  ```

  **Si el usuario tiene 2FA habilitado:**
  ```json
  {
    "message": "Se requiere código 2FA",
    "requiresTwoFactor": true,
    "tempToken": "temporary-token"
  }
  ```

  #### 4. Verificar Código 2FA
  ```http
  POST /auth/verify-2fa
  Content-Type: application/json

  {
    "tempToken": "temporary-token",
    "code": "123456"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Autenticación 2FA exitosa",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

  #### 5. Configurar 2FA con Google Authenticator
  ```http
  POST /auth/setup-2fa
  Authorization: Cookie (access_token)
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "qrCode": "data:image/png;base64,...",
    "secret": "JBSWY3DPEHPK3PXP",
    "manualEntryKey": "JBSWY3DPEHPK3PXP",
    "appName": "SA-Lab-Auth",
    "backupCodes": [
      "XXXX-XXXX",
      "YYYY-YYYY",
      "ZZZZ-ZZZZ"
    ],
    "instructions": {
      "step1": "Install Google Authenticator on your phone",
      "step2": "Open the app and tap the + button",
      "step3": "Select 'Scan a QR code' and scan the code below",
      "step4": "Or select 'Enter a setup key' and enter the manual key",
      "step5": "Enter the 6-digit code from the app to confirm"
    }
  }
  ```

  📱 **Para configurar Google Authenticator**, consulta [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)

  #### 6. Confirmar Configuración 2FA
  ```http
  POST /auth/confirm-2fa
  Authorization: Cookie (access_token)
  Content-Type: application/json

  {
    "code": "123456"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "2FA habilitado exitosamente"
  }
  ```

  #### 7. Renovar Token
  ```http
  POST /auth/refresh
  Authorization: Cookie (refresh_token)
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Token renovado exitosamente"
  }
  ```

  #### 8. Logout
  ```http
  POST /auth/logout
  Authorization: Cookie (access_token)
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Logout exitoso"
  }
  ```

  #### 9. Login con Google OAuth
  ```http
  GET /auth/google
  ```

  **Flujo:**
  1. Redirige al usuario a Google para autenticación
  2. Google redirige de vuelta a `/auth/google/callback`
  3. El sistema crea/actualiza el usuario y establece las cookies JWT
  4. Redirige al frontend con tokens establecidos

  **Callback URL configurado:**
  ```
  http://localhost:3000/auth/google/callback
  ```

  #### 10. Obtener URL de Google OAuth
  ```http
  GET /auth/google/url
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "url": "/auth/google",
    "fullUrl": "http://localhost:3000/auth/google"
  }
  ```

  ### 👤 Usuario

  #### 1. Obtener Perfil
  ```http
  GET /users/profile
  Authorization: Cookie (access_token)
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "isEmailVerified": true,
      "twoFactorEnabled": false,
      "createdAt": "2025-01-16T00:00:00Z",
      "lastLogin": "2025-01-16T10:00:00Z"
    }
  }
  ```

  #### 2. Actualizar Perfil
  ```http
  PUT /users/profile
  Authorization: Cookie (access_token)
  Content-Type: application/json

  {
    "name": "Jane Doe"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Perfil actualizado exitosamente",
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "Jane Doe"
    }
  }
  ```

  #### 3. Cambiar Contraseña
  ```http
  POST /users/change-password
  Authorization: Cookie (access_token)
  Content-Type: application/json

  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword456!"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "Contraseña actualizada exitosamente"
  }
  ```

  #### 4. Deshabilitar 2FA
  ```http
  DELETE /users/2fa
  Authorization: Cookie (access_token)
  Content-Type: application/json

  {
    "password": "UserPassword123!"
  }
  ```

  **Respuesta exitosa (200):**
  ```json
  {
    "message": "2FA deshabilitado exitosamente"
  }
  ```

  ## 🔒 Seguridad

  ### Cookies HTTP-Only
  Los tokens JWT se almacenan en cookies HTTP-Only con las siguientes configuraciones:
  - `httpOnly`: true (no accesible via JavaScript)
  - `secure`: true (solo HTTPS en producción)
  - `sameSite`: 'strict' (protección CSRF)
  - `maxAge`: Según configuración de JWT

  ### Rate Limiting
  - **Login**: Máximo 5 intentos, luego bloqueo de 15 minutos
  - **API General**: 100 requests por minuto por IP

  ### Encriptación
  - **Contraseñas**: Hasheadas con bcrypt (10 rounds)
  - **Datos sensibles**: Encriptados con AES-256
  - **Tokens**: Firmados con HS256

  ## 🛠️ Tecnologías Utilizadas

  ### Backend
  - **Node.js & Express**: Framework web
  - **TypeScript**: Type safety y mejor DX
  - **Prisma**: ORM para PostgreSQL
  - **JWT**: Autenticación stateless
  - **Google OAuth 2.0**: 
    - **Passport.js**: Estrategia de autenticación con Google
    - **passport-google-oauth20**: Integración con Google OAuth
  - **Google Authenticator (2FA)**: 
    - **Speakeasy**: Generación y verificación de códigos TOTP
    - **QRCode**: Generación de códigos QR para Google Authenticator
  - **Nodemailer**: Envío de emails con Gmail SMTP
  - **Helmet**: Headers de seguridad
  - **Express-rate-limit**: Protección contra brute force

  ### Base de Datos
  - **PostgreSQL**: Base de datos relacional
  - **Prisma**: ORM con migraciones y type safety

  ## 📝 Códigos de Estado HTTP

  | Código | Descripción |
  |--------|-------------|
  | 200 | Solicitud exitosa |
  | 201 | Recurso creado exitosamente |
  | 400 | Solicitud incorrecta (validación fallida) |
  | 401 | No autorizado (token inválido/expirado) |
  | 403 | Prohibido (sin permisos) |
  | 404 | Recurso no encontrado |
  | 429 | Demasiadas solicitudes (rate limit) |
  | 500 | Error interno del servidor |

  ## 🔍 Manejo de Errores

  Todas las respuestas de error siguen el formato:
  ```json
  {
    "error": "Mensaje de error descriptivo",
    "code": "ERROR_CODE",
    "details": {} // Opcional, información adicional
  }
  ```

  ### Códigos de Error Comunes
  - `INVALID_CREDENTIALS`: Email o contraseña incorrectos
  - `TOKEN_EXPIRED`: Token JWT expirado
  - `TOKEN_INVALID`: Token JWT inválido
  - `EMAIL_NOT_VERIFIED`: Email no verificado
  - `ACCOUNT_LOCKED`: Cuenta bloqueada por intentos fallidos
  - `2FA_REQUIRED`: Se requiere código 2FA
  - `2FA_INVALID`: Código 2FA incorrecto

  ## 🧪 Testing

  ```bash
  # Ejecutar tests (cuando estén implementados)
  npm test

  # Tests con coverage
  npm run test:coverage
  ```

  ## 📦 Scripts Disponibles

  ```bash
  npm run dev          # Iniciar servidor en modo desarrollo
  npm run build        # Compilar TypeScript a JavaScript
  npm start           # Iniciar servidor en producción
  npm run prisma:generate  # Generar cliente Prisma
  npm run prisma:migrate   # Ejecutar migraciones
  npm run prisma:studio    # Abrir Prisma Studio (GUI)
  npm run prisma:seed      # Poblar base de datos con datos de prueba
  ```

  ## 🏗️ Estructura del Proyecto

  ```
  backend/
  ├── src/
  │   ├── config/          # Configuraciones (env, database)
  │   ├── controllers/     # Controladores de rutas
  │   ├── middlewares/     # Middlewares (auth, rate limit)
  │   ├── routes/          # Definición de rutas
  │   ├── services/        # Lógica de negocio
  │   ├── utils/           # Utilidades (jwt, encryption)
  │   ├── types/           # TypeScript types
  │   └── index.ts         # Entry point
  ├── prisma/
  │   ├── schema.prisma    # Esquema de base de datos
  │   └── migrations/      # Migraciones
  ├── .env                 # Variables de entorno
  ├── .env.example         # Template de variables
  ├── package.json         # Dependencias
  └── tsconfig.json        # Configuración TypeScript
  ```

  ## 📄 Licencia
  ISC

  ## 👨‍💻 Autor
  Software Avanzado - USAC 2025