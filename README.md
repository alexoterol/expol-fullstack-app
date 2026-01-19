# ExPol Marketplace

Plataforma de compra y venta entre estudiantes universitarios desarrollada como proyecto de Lenguajes de Programación - ESPOL.

## 👥 Equipo de Desarrollo

| Integrante | Responsabilidades |
|------------|-------------------|
| **José Chong** | Sistema de Chat, Mensajería en tiempo real, WebSocket |
| **Alex Otero** | Búsqueda avanzada, Filtros, Favoritos, Perfiles de usuario |
| **Alexandre Icaza** | Gestión de publicaciones, CRUD de productos |


---

## 📋 Requisitos Previos

Antes de comenzar, asegúrese de tener instalado:

1. **Docker Desktop** (incluye Docker y Docker Compose)
   - Windows/Mac: [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Linux: Instalar Docker Engine + Docker Compose

2. **Git** (opcional, para clonar el repositorio)

### Verificar instalación

```bash
docker --version          # Docker version 24.0+
docker-compose --version  # Docker Compose version 2.20+
```

---

## 🚀 Instalación y Ejecución

### 1. Descomprimir el proyecto

```bash
unzip expol-fullstack-app.zip
cd expol-fullstack-app
```

### 2. Levantar los contenedores

```bash
# Construir e iniciar todos los servicios
docker-compose up --build
```

Este comando iniciará:
- **PostgreSQL** en puerto `5432`
- **Redis** en puerto `6379`
- **Rails API** en puerto `3000`
- **Go WebSocket** en puerto `8080`
- **React Frontend** en puerto `5173`

### 3. Ejecutar migraciones y datos de prueba

En una nueva terminal:

```bash
# Crear tablas en la base de datos
docker-compose exec rails-api rails db:migrate

# Cargar datos de prueba
docker-compose exec rails-api rails db:seed
```

### 4. Acceder a la aplicación

Abrir en el navegador: **http://localhost:5173**

---

## 🧪 Pruebas del Backend (API REST)

### Endpoints Disponibles

#### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar nuevo usuario |
| POST | `/api/v1/auth/login` | Iniciar sesión |

#### Publicaciones (Listings)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/listings` | Listar todas las publicaciones |
| GET | `/api/v1/listings/:id` | Ver detalle de publicación |
| POST | `/api/v1/listings` | Crear publicación (auth) |
| PUT | `/api/v1/listings/:id` | Actualizar publicación (auth) |
| DELETE | `/api/v1/listings/:id` | Eliminar publicación (auth) |
| GET | `/api/v1/listings/my_listings` | Mis publicaciones (auth) |

#### Búsqueda
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/search` | Buscar con filtros |
| GET | `/api/v1/search/suggestions` | Sugerencias de búsqueda |
| GET | `/api/v1/search/categories_stats` | Estadísticas por categoría |

#### Favoritos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/favorites` | Listar favoritos (auth) |
| POST | `/api/v1/favorites` | Agregar a favoritos (auth) |
| DELETE | `/api/v1/favorites/remove_by_listing/:id` | Quitar de favoritos (auth) |
| GET | `/api/v1/favorites/check/:id` | Verificar si es favorito (auth) |

#### Conversaciones y Mensajes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/conversations` | Listar conversaciones (auth) |
| GET | `/api/v1/conversations/:id` | Ver conversación con mensajes (auth) |
| POST | `/api/v1/conversations` | Crear/obtener conversación (auth) |
| POST | `/api/v1/conversations/:id/messages` | Enviar mensaje (auth) |
| PATCH | `/api/v1/conversations/:id/messages/mark_read` | Marcar como leídos (auth) |

#### Health Check
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |

### Ejemplos de Prueba con cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jose.chong@espol.edu.ec", "password": "password123"}'
```

#### Listar publicaciones
```bash
curl http://localhost:3000/api/v1/listings
```

#### Buscar por categoría
```bash
curl "http://localhost:3000/api/v1/search?category=Electrónicos"
```

#### Crear publicación (con token)
```bash
curl -X POST http://localhost:3000/api/v1/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "listing": {
      "title": "MacBook Pro 2023",
      "description": "Laptop en excelente estado",
      "price": 1200.00,
      "category": "Electrónicos",
      "state": "usado",
      "location": "FIEC"
    }
  }'
```

#### Iniciar conversación
```bash
curl -X POST http://localhost:3000/api/v1/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"listing_id": 1}'
```

#### Enviar mensaje
```bash
curl -X POST http://localhost:3000/api/v1/conversations/1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"content": "Hola, ¿sigue disponible?"}'
```

---

## 🖥️ Pruebas del Frontend

### Usuarios de Prueba

| Email | Contraseña | Nombre |
|-------|------------|--------|
| jose.chong@espol.edu.ec | password123 | José Chong |
| alex.otero@espol.edu.ec | password123 | Alex Otero |
| alexandre.icaza@espol.edu.ec | password123 | Alexandre Icaza |
| usuario1@espol.edu.ec | password123 | María García |

### Flujos de Prueba

#### 1. Registro e Inicio de Sesión
1. Abrir http://localhost:5173
2. Click en "Iniciar Sesión"
3. Usar credenciales de prueba o registrar nuevo usuario
4. Verificar que aparece el nombre en el navbar

#### 2. Explorar y Buscar Productos
1. Ver publicaciones en la página principal
2. Click en una categoría (ej: "Electrónicos")
3. Usar filtros de precio y estado
4. Escribir en la barra de búsqueda

#### 3. Gestión de Favoritos
1. Iniciar sesión
2. Click en el corazón de cualquier producto
3. Ir a "Favoritos" (ícono corazón en navbar)
4. Verificar que aparecen los productos guardados
5. Quitar de favoritos haciendo click en el corazón

#### 4. Publicar Producto
1. Iniciar sesión
2. Click en "Publicar"
3. Llenar formulario con todos los campos
4. Click en "Publicar producto"
5. Verificar en "Mi Perfil" que aparece la publicación

#### 5. Sistema de Mensajería
1. Iniciar sesión con un usuario (ej: jose.chong@espol.edu.ec)
2. Ver un producto de OTRO usuario
3. Click en "Contactar"
4. Escribir un mensaje y enviarlo
5. Ir a "Mensajes" (ícono chat en navbar)
6. Verificar que aparece la conversación
7. **Para probar tiempo real:**
   - Abrir otra ventana en modo incógnito
   - Iniciar sesión con el vendedor del producto
   - Ir a "Mensajes"
   - Ver que aparece la conversación y el mensaje

#### 6. Gestión de Publicaciones
1. Iniciar sesión
2. Ir a "Mi Perfil"
3. Ver lista de publicaciones propias
4. Filtrar por estado (Activas/Vendidas)
5. Eliminar una publicación

---

## 📁 Estructura del Proyecto

```
expol-fullstack-app/
├── docker-compose.yml          # Orquestación de contenedores
├── .env.example                 # Variables de entorno de ejemplo
├── README.md                    # Este archivo
│
├── rails-api/                   # Backend Ruby on Rails
│   ├── app/
│   │   ├── controllers/v1/      # Controladores API
│   │   │   ├── auth_controller.rb
│   │   │   ├── listings_controller.rb
│   │   │   ├── search_controller.rb
│   │   │   ├── favorites_controller.rb
│   │   │   ├── conversations_controller.rb
│   │   │   └── messages_controller.rb
│   │   └── models/              # Modelos ActiveRecord
│   │       ├── user.rb
│   │       ├── listing.rb
│   │       ├── favorite.rb
│   │       ├── conversation.rb
│   │       └── message.rb
│   ├── config/
│   │   ├── routes.rb            # Definición de rutas API
│   │   └── database.yml         # Configuración PostgreSQL
│   ├── db/
│   │   ├── migrate/             # Migraciones de BD
│   │   ├── schema.rb            # Esquema actual
│   │   └── seeds.rb             # Datos de prueba
│   ├── Dockerfile
│   ├── Gemfile                  # Dependencias Ruby
│   └── Gemfile.lock
│
├── react-frontend/              # Frontend React
│   ├── src/
│   │   ├── App.jsx              # Componente principal
│   │   ├── services/
│   │   │   ├── api.js           # Cliente API REST
│   │   │   └── websocket.js     # Cliente WebSocket
│   │   └── main.jsx             # Entry point
│   ├── package.json             # Dependencias Node.js
│   ├── vite.config.js           # Configuración Vite
│   └── Dockerfile
│
└── go-realtime/                 # Servicio WebSocket Go
    ├── main.go                  # Servidor WebSocket
    ├── go.mod                   # Dependencias Go
    ├── go.sum
    └── Dockerfile
```

---

## 🔧 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Reconstruir contenedores
docker-compose up --build

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (resetear BD)
docker-compose down -v

# Ver logs de un servicio
docker-compose logs -f rails-api
docker-compose logs -f react-frontend
docker-compose logs -f go-realtime
```

### Rails

```bash
# Ejecutar migraciones
docker-compose exec rails-api rails db:migrate

# Revertir última migración
docker-compose exec rails-api rails db:rollback

# Cargar seeds
docker-compose exec rails-api rails db:seed

# Resetear base de datos
docker-compose exec rails-api rails db:reset

# Consola Rails
docker-compose exec rails-api rails console

# Ver rutas disponibles
docker-compose exec rails-api rails routes
```

---


