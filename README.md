# ExPol - Marketplace Universitario

Backend del sistema de marketplace para la comunidad universitaria ESPOL.

## Arquitectura

El proyecto está dividido en dos servicios principales:

- **Rails API** (`/rails-api`): Servicio principal con toda la lógica de negocio
- **Go Realtime Service** (`/go-realtime`): Servicio de mensajería en tiempo real

## Requisitos Previos

- Ruby 3.2+
- Rails 7.1+
- PostgreSQL 15+
- Go 1.21+
- Redis
- Node.js 18+ (para frontend)

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/expol-marketplace.git
cd expol-marketplace
```

### 2. Configurar Rails API

```bash
cd rails-api
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

### 3. Configurar Go Realtime Service

```bash
cd go-realtime
go mod download
go run main.go
```

### 4. Variables de Entorno

Crear archivo `.env` en cada servicio:

**rails-api/.env**
```
DATABASE_URL=postgresql://localhost/expol_development
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=tu_jwt_secret_aqui
AWS_ACCESS_KEY_ID=tu_aws_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret
AWS_REGION=us-east-1
AWS_BUCKET=expol-images
SENDGRID_API_KEY=tu_sendgrid_key
```

**go-realtime/.env**
```
DATABASE_URL=postgresql://localhost/expol_development
REDIS_URL=redis://localhost:6379/1
PORT=8080
JWT_SECRET=tu_jwt_secret_aqui
```

## Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/verify-email` - Verificación de correo

### Publicaciones (Alexandre Icaza)
- `POST /api/v1/listings` - Crear publicación
- `GET /api/v1/listings` - Listar publicaciones
- `GET /api/v1/listings/:id` - Ver publicación
- `PUT /api/v1/listings/:id` - Editar publicación
- `DELETE /api/v1/listings/:id` - Eliminar publicación

### Chat (José Chong)
- `GET /api/v1/conversations` - Listar conversaciones
- `GET /api/v1/conversations/:id` - Ver conversación
- `POST /api/v1/conversations/:id/messages` - Enviar mensaje
- `DELETE /api/v1/conversations/:id` - Eliminar conversación
- WebSocket: `ws://localhost:8080/ws` - Conexión tiempo real

### Búsqueda y Favoritos (Alex Otero)
- `GET /api/v1/search` - Búsqueda avanzada
- `POST /api/v1/favorites` - Agregar a favoritos
- `GET /api/v1/favorites` - Listar favoritos
- `DELETE /api/v1/favorites/:id` - Quitar de favoritos
- `GET /api/v1/users/:id/profile` - Ver perfil de usuario

## Testing

### Rails API
```bash
cd rails-api
rspec
```

### Go Service
```bash
cd go-realtime
go test ./...
```

## Docker (Opcional)

```bash
docker-compose up
```

## Estructura del Proyecto

```
expol-marketplace/
├── rails-api/           # Backend principal (Rails)
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── serializers/
│   │   └── services/
│   ├── config/
│   ├── db/
│   └── spec/
├── go-realtime/        # Servicio de mensajería (Go)
│   ├── handlers/
│   ├── models/
│   ├── websocket/
│   └── main.go
└── docker-compose.yml
```

## Contribuidores

- Alexandre Icaza - Sistema de Publicaciones
- José Chong - Sistema de Mensajería
- Alex Otero - Búsqueda y Favoritos

## Licencia

MIT License