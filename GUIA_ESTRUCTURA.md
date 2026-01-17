# 📁 GUÍA DE ESTRUCTURA - ExPol Marketplace

## 🎯 Resumen Rápido

El proyecto tiene 3 partes principales:
1. **rails-api/** - Backend principal (Ruby on Rails)
2. **go-realtime/** - Servicio WebSocket (Go)
3. **react-frontend/** - Interfaz de usuario (React + Vite)

---

## 📂 ESTRUCTURA COMPLETA DEL PROYECTO

```
expol-fullstack-app/
│
├── 📄 docker-compose.yml      # Orquesta todos los servicios
├── 📄 .env.example            # Variables de entorno (copiar como .env)
├── 📄 setup.sh                # Script para levantar todo automáticamente
├── 📄 README.md               # Documentación general
│
├── 📁 rails-api/              # ======= BACKEND RAILS =======
│   ├── Dockerfile
│   ├── Gemfile
│   ├── Gemfile.lock
│   │
│   ├── 📁 app/
│   │   ├── 📁 controllers/
│   │   │   └── 📁 v1/         # Todos los controladores API
│   │   │       ├── auth_controller.rb       # Login/Register
│   │   │       ├── listings_controller.rb   # CRUD Publicaciones
│   │   │       ├── favorites_controller.rb  # Favoritos
│   │   │       ├── search_controller.rb     # Búsqueda
│   │   │       └── users_controller.rb      # Perfiles
│   │   │
│   │   └── 📁 models/         # Modelos de datos
│   │       ├── user.rb
│   │       ├── listing.rb
│   │       ├── favorite.rb
│   │       └── rating.rb
│   │
│   ├── 📁 config/
│   │   ├── routes.rb          # Rutas de la API
│   │   └── database.yml       # Configuración BD
│   │
│   └── 📁 db/
│       ├── 📁 migrate/        # Migraciones de BD
│       ├── schema.rb          # Esquema actual
│       └── seeds.rb           # Datos de prueba
│
├── 📁 go-realtime/            # ======= WEBSOCKET GO =======
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   └── main.go                # Todo el servicio WebSocket
│
└── 📁 react-frontend/         # ======= FRONTEND REACT =======
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    │
    └── 📁 src/
        ├── App.jsx            # ⭐ APLICACIÓN PRINCIPAL (todo integrado)
        ├── main.jsx           # Punto de entrada
        ├── index.css          # Estilos globales
        │
        └── 📁 services/       # Servicios de conexión
            ├── api.js         # Conexión con Rails API
            └── websocket.js   # Conexión WebSocket
```

---

## 🔧 INSTRUCCIONES DE INSTALACIÓN

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Entrar a la carpeta del proyecto
cd expol-fullstack-app

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo con Docker
docker-compose up --build

# 4. En otra terminal, ejecutar migraciones y seeds
docker-compose exec rails-api rails db:migrate db:seed
```

### Opción 2: Sin Docker (Manual)

**Terminal 1 - PostgreSQL y Redis:**
```bash
# Instalar y ejecutar PostgreSQL (puerto 5432)
# Instalar y ejecutar Redis (puerto 6379)
```

**Terminal 2 - Rails API:**
```bash
cd rails-api
bundle install
rails db:create db:migrate db:seed
rails server -p 3000
```

**Terminal 3 - Go WebSocket:**
```bash
cd go-realtime
go mod download
go run main.go
```

**Terminal 4 - React Frontend:**
```bash
cd react-frontend
npm install
npm run dev
```

---

## 🌐 URLS DE ACCESO

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Interfaz de usuario |
| Rails API | http://localhost:3000/api/v1 | Backend REST |
| WebSocket | ws://localhost:8080/ws | Mensajería tiempo real |
| Health Rails | http://localhost:3000/health | Estado del backend |
| Health Go | http://localhost:8080/health | Estado WebSocket |

---

## 👤 USUARIOS DE PRUEBA

| Email | Password | Nombre |
|-------|----------|--------|
| alexandre.icaza@espol.edu.ec | password123 | Alexandre Icaza |
| jose.chong@espol.edu.ec | password123 | Jose Chong |
| alex.otero@espol.edu.ec | password123 | Alex Otero |

---

## 🔌 ENDPOINTS DE LA API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Registrar usuario |
| POST | /api/v1/auth/login | Iniciar sesión |

### Publicaciones (Listings)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/v1/listings | Listar todas |
| GET | /api/v1/listings/:id | Ver detalle |
| POST | /api/v1/listings | Crear nueva |
| PUT | /api/v1/listings/:id | Actualizar |
| DELETE | /api/v1/listings/:id | Eliminar |
| GET | /api/v1/listings/my_listings | Mis publicaciones |
| PATCH | /api/v1/listings/:id/toggle_status | Pausar/Activar |

### Búsqueda
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/v1/search?query=X | Buscar productos |
| GET | /api/v1/search/suggestions?q=X | Sugerencias |
| GET | /api/v1/search/categories_stats | Stats por categoría |

### Favoritos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/v1/favorites | Mis favoritos |
| POST | /api/v1/favorites | Agregar favorito |
| DELETE | /api/v1/favorites/:id | Quitar favorito |
| GET | /api/v1/favorites/check/:listing_id | Verificar si es favorito |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/v1/users/me | Mi perfil |
| GET | /api/v1/users/:id/profile | Perfil público |
| GET | /api/v1/users/:id/listings | Publicaciones de usuario |

---

## 📋 QUÉ HIZO CADA INTEGRANTE

### Alexandre Icaza - Sistema de Publicaciones
**Backend Rails:**
- `app/controllers/v1/listings_controller.rb`
- `app/models/listing.rb`
- Migraciones de listings

**Frontend React (en App.jsx):**
- Componente `CreateListingPage`
- Componente `ProductDetailPage`
- Panel "Mis Publicaciones" en `ProfilePage`
- Funciones CRUD de listings

### Jose Chong - Sistema de Mensajería
**Servicio Go:**
- `go-realtime/main.go` (WebSocket completo)
- Integración Redis pub/sub
- Manejo de conexiones en tiempo real

**Frontend React (en App.jsx):**
- Componente `MessagesPage`
- Servicio `services/websocket.js`
- UI de conversaciones

### Alex Otero - Búsqueda y Favoritos
**Backend Rails:**
- `app/controllers/v1/search_controller.rb`
- `app/controllers/v1/favorites_controller.rb`
- `app/controllers/v1/users_controller.rb`
- `app/models/favorite.rb`

**Frontend React (en App.jsx):**
- Componente `SearchPage` con filtros
- Componente `FavoritesPage`
- Componente `ProfilePage`
- Botón de favoritos (corazón)

---

## 🧪 PROBAR LA API CON CURL

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jose.chong@espol.edu.ec","password":"password123"}'

# Guardar el token que devuelve

# 2. Ver publicaciones
curl http://localhost:3000/api/v1/listings

# 3. Buscar
curl "http://localhost:3000/api/v1/search?query=laptop"

# 4. Crear publicación (con token)
curl -X POST http://localhost:3000/api/v1/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"listing":{"title":"Mi producto","price":50,"category":"Otros","state":"nuevo","location":"Campus"}}'
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Error: "Connection refused" al conectar con API
- Verificar que Rails está corriendo en puerto 3000
- Si usas Docker: `docker-compose ps` para ver estado

### Error: Base de datos no existe
```bash
# Con Docker:
docker-compose exec rails-api rails db:create db:migrate db:seed

# Sin Docker:
cd rails-api && rails db:create db:migrate db:seed
```

### Error: Puerto en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :3000
# Matar el proceso
kill -9 PID
```

### Frontend no carga datos
- Verificar que Rails API responde: http://localhost:3000/api/v1/listings
- Revisar consola del navegador (F12) para ver errores
- El frontend tiene datos mock como fallback

---

## 📝 COMANDOS ÚTILES

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f rails-api

# Reiniciar un servicio
docker-compose restart rails-api

# Entrar al contenedor de Rails
docker-compose exec rails-api bash

# Ejecutar consola de Rails
docker-compose exec rails-api rails console

# Detener todo
docker-compose down

# Detener y borrar volúmenes (reset completo)
docker-compose down -v
```

---

## ✅ CHECKLIST ANTES DE ENTREGAR

- [ ] El proyecto levanta con `docker-compose up`
- [ ] Se puede hacer login con usuarios de prueba
- [ ] Se pueden ver las publicaciones
- [ ] Funciona la búsqueda con filtros
- [ ] Se pueden agregar/quitar favoritos
- [ ] El perfil muestra las publicaciones del usuario
- [ ] Se puede crear una nueva publicación
- [ ] El README.md está actualizado

---

## 📚 TECNOLOGÍAS UTILIZADAS

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React | 18 |
| Frontend | Vite | 5.x |
| Frontend | Tailwind CSS | 3.x |
| Backend | Ruby on Rails | 7.1 |
| Backend | Ruby | 3.2 |
| WebSocket | Go | 1.21 |
| WebSocket | Gorilla WebSocket | 1.5 |
| Base de datos | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Contenedores | Docker | Latest |
