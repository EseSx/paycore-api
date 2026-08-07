# PayCore API

API REST de gestión de pagos y transacciones, construida como proyecto de portfolio para practicar y demostrar competencias de backend fullstack en un dominio fintech: autenticación segura, diseño y optimización de base de datos MySQL, y patrones de integración resilientes.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Lenguaje | TypeScript (`strict` habilitado) |
| Framework | Express 5 |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-mariadb`) |
| Base de datos | MySQL 8 (vía Docker) |
| Autenticación | JWT (access + refresh tokens) + bcrypt |
| Validación | Zod |
| Resiliencia | Circuit breaker (`opossum`) |
| Dev server | ts-node-dev |

## Mapa del proyecto
```
paycore-api
├─ README.md
├─ docker-compose.yml
├─ package-lock.json
├─ package.json
├─ prisma
│  ├─ migrations
│  │  ├─ 20260719031612_init
│  │  │  └─ migration.sql
│  │  ├─ 20260719043313_add_refresh_tokens
│  │  │  └─ migration.sql
│  │  ├─ 20260807145639_fix_decimal_precision
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  └─ schema.prisma
├─ prisma.config.ts
├─ src
│  ├─ app.ts
│  ├─ config
│  │  └─ prisma.ts
│  ├─ middlewares
│  │  └─ auth.middleware.ts
│  ├─ modules
│  │  ├─ accounts
│  │  │  ├─ accounts.controller.ts
│  │  │  ├─ accounts.routes.ts
│  │  │  ├─ accounts.schemas.ts
│  │  │  └─ accounts.service.ts
│  │  ├─ auth
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.routes.ts
│  │  │  ├─ auth.schemas.ts
│  │  │  └─ auth.service.ts
│  │  ├─ payments
│  │  │  ├─ paymentBreaker.ts
│  │  │  └─ paymentGateway.ts
│  │  └─ transactions
│  │     ├─ transactions.controller.ts
│  │     ├─ transactions.routes.ts
│  │     ├─ transactions.schemas.ts
│  │     └─ transactions.service.ts
│  ├─ server.ts
│  └─ utils
│     ├─ jwt.ts
│     └─ password.ts
└─ tsconfig.json

```

## Arquitectura

El proyecto sigue una estructura modular por dominio (no por tipo de archivo), donde cada módulo de negocio es autocontenido:

```
src/
  config/
    prisma.ts              # Singleton de PrismaClient con el driver adapter de MySQL
  middlewares/
    auth.middleware.ts      # Verificación de JWT en rutas protegidas
  modules/
    auth/                   # Registro, login, refresh y logout
    accounts/               # CRUD de cuentas del usuario autenticado
    transactions/           # Movimientos, historial e integración con la pasarela
    payments/               # Simulación de pasarela externa + circuit breaker
  utils/
    jwt.ts                  # Firma y verificación de tokens
    password.ts             # Hash y comparación de contraseñas
  app.ts                    # Configuración de Express y montaje de rutas
  server.ts                 # Punto de entrada
prisma/
  schema.prisma             # Modelos de datos y migraciones
```

Cada módulo de negocio sigue el mismo patrón de capas:

```
routes.ts       →  define los endpoints y aplica middlewares
controller.ts   →  valida el input, llama al service, arma la respuesta HTTP
service.ts      →  lógica de negocio y acceso a datos (Prisma)
schemas.ts      →  validación de payloads con Zod
```

## Modelo de datos

- **User** — cuenta de usuario, con contraseña hasheada (bcrypt)
- **Account** — cuenta financiera del usuario, `balance` como `Decimal(12,2)` (nunca `Float`, para evitar errores de precisión con dinero)
- **Transaction** — movimiento de una cuenta (`deposit` / `withdrawal`), con índice compuesto `@@index([accountId, createdAt])` para optimizar la query de historial
- **RefreshToken** — tokens de refresco persistidos en base, para poder revocarlos antes de su expiración natural

## Seguridad

- Contraseñas hasheadas con **bcrypt** (12 salt rounds)
- Autenticación stateless con **JWT de acceso** (vida corta, 15 min) + **JWT de refresco** (vida larga, 7 días) con secretos independientes
- Refresh tokens persistidos en base de datos para permitir **revocación real** (logout invalida el token en vez de solo esperar su expiración)
- Middleware `requireAuth` protegiendo todas las rutas de `accounts` y `transactions`
- Cada consulta a `Account`/`Transaction` filtra explícitamente por el `userId` del token, no solo por el ID del recurso — previene acceso a recursos de otros usuarios (IDOR)
- `helmet` y `cors` configurados en la capa de Express

## Resiliencia: circuit breaker

El módulo `payments/` simula una pasarela de pago externa poco confiable y envuelve la llamada con un circuit breaker (`opossum`), con tres estados:

- **Closed** (normal): las llamadas pasan directo a la pasarela
- **Open**: tras detectar fallas repetidas, corta las llamadas inmediatamente y responde con un fallback, evitando que un servicio externo caído deje esperando (timeout) a cada request entrante
- **Half-open**: pasado el `resetTimeout`, prueba la pasarela de nuevo antes de decidir si vuelve a `closed` o a `open`

Este patrón se activa en el flujo de depósitos (`POST /api/transactions` con `type: "deposit"`).

## Setup local

### Prerrequisitos
- Node.js 20+
- Docker (para MySQL)

### Pasos

```bash
# 1. Clonar e instalar
git clone https://github.com/EseSx/paycore-api.git
cd paycore-api
npm install

# 2. Levantar MySQL
docker compose up -d

# 3. Variables de entorno (crear .env en la raíz)
DATABASE_URL="mysql://root:rootpass@localhost:3306/paycore"
JWT_ACCESS_SECRET=un-secreto-largo-random
JWT_REFRESH_SECRET=otro-secreto-distinto
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000

# 4. Generar el cliente de Prisma y correr migraciones
npx prisma generate
npx prisma migrate dev

# 5. Levantar el servidor
npm run dev
```

El servidor queda disponible en `http://localhost:3000`, con `/health` como endpoint de verificación rápida.

## Endpoints

### Auth (`/api/auth`) — públicos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/register` | Crea un usuario y devuelve access + refresh token |
| POST | `/login` | Autentica y devuelve access + refresh token |
| POST | `/refresh` | Emite un nuevo access token a partir de un refresh token válido |
| POST | `/logout` | Revoca el refresh token |

### Accounts (`/api/accounts`) — requieren `Authorization: Bearer <accessToken>`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/` | Crea una cuenta para el usuario autenticado |
| GET | `/` | Lista las cuentas del usuario autenticado |
| GET | `/:id` | Obtiene una cuenta puntual (solo si pertenece al usuario) |

### Transactions (`/api/transactions`) — requieren autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/` | Crea un movimiento (`deposit`/`withdrawal`), actualiza el balance de forma atómica |
| GET | `/account/:accountId` | Historial de movimientos de una cuenta, ordenado por fecha |

## Decisiones técnicas destacadas

- **Transacciones atómicas de MySQL** (`prisma.$transaction`) al registrar un movimiento: el update del balance y la creación del registro se confirman o revierten juntos, evitando balances desincronizados ante un fallo parcial.
- **`Decimal(12,2)` en vez de `Float`** para todos los montos, evitando errores de redondeo propios de la coma flotante en contextos financieros.
- **Refresh tokens persistidos**, no solo firmados: permite revocación real (logout efectivo) en vez de depender únicamente de la expiración del JWT.
- **Circuit breaker con fallback explícito**, no solo reintentos: prioriza la disponibilidad general de la API por sobre completar cada pago individual cuando la pasarela está degradada.

## Posibles próximos pasos

- Tests automatizados (unitarios de `service.ts`, integración de endpoints)
- Paginación en el historial de transacciones
- Rate limiting en `/api/auth/login` para mitigar fuerza bruta
- Logs estructurados y métricas de circuit breaker