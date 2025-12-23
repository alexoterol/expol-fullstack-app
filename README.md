# ExPol - Marketplace Universitario 🎓🛒

ExPol es una plataforma centralizada de compra y venta diseñada exclusivamente para la comunidad de la **ESPOL**. Permite a los estudiantes intercambiar libros, equipos tecnológicos y otros bienes de forma segura, organizada y confiable.

## 🚀 Características Principales

- **Autenticación Institucional:** Registro obligatorio con correo `@espol.edu.ec`.
- **Arquitectura Híbrida:** Backend robusto en Ruby on Rails y servicios en tiempo real optimizados en Go.
- **Mensajería en Tiempo Real:** Chat interno para negociaciones directas.
- **Filtros Avanzados:** Búsqueda por categorías, precio, estado del producto y ubicación.

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza un enfoque de microservicios para separar la lógica de negocio compleja de la comunicación de alta concurrencia.



- **Frontend:** React 18 + TypeScript + Tailwind CSS.
- **Main API (Negocio):** Ruby on Rails 7.1 + PostgreSQL 15.
- **Realtime Service (Chat):** Go 1.21 + WebSockets (Gorilla).
- **Infraestructura:** Docker & Docker Compose para contenedores.

---

## 👥 Integrantes y Responsabilidades

| Integrante | Componente | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Alexandre Icaza** | Backend (Rails) | Gestión de publicaciones (CRUD), carga de imágenes y listados. |
| **Jose Luis Chong** | Realtime (Go) | Sistema de chat en tiempo real, notificaciones push y gestión de mensajes. |
| **Alex Otero Limones** | Backend (Rails) | Motor de búsqueda avanzada, perfiles de usuario y sistema de favoritos. |

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Ruby on Rails:** Framework principal para la lógica de negocio [1].
- **Go (Golang):** Servicio especializado en WebSockets por su eficiencia en concurrencia [2].
- **PostgreSQL:** Base de datos relacional para persistencia de datos [5].
- **Redis:** Gestión de cache y sesiones de chat.

### Frontend
- **React & TypeScript:** SPA para una interfaz reactiva y tipada [3][4].
- **Tailwind CSS:** Diseño responsive y moderno.

---

## 📦 Instalación y Configuración (Desarrollo)

### Prerrequisitos
- Docker y Docker Compose
- Ruby 3.2.x (opcional para local)
- Go 1.21+ (opcional para local)

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/expol-marketplace.git](https://github.com/tu-usuario/expol-marketplace.git)
   cd expol-marketplace
   ```
2.  **Levantar servicios con Docker:**
    ```bash
    docker-compose up --build
    ```
2.  **Configurar base de datos (Rails):**
    ```bash
    docker-compose run web rails db:create db:migrate
    ```
    