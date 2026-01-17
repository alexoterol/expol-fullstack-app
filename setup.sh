#!/bin/bash

# ===========================================
# EXPOL MARKETPLACE - Script de Setup
# ===========================================

echo "🚀 Configurando ExPol Marketplace..."

# Verificar requisitos
command -v docker >/dev/null 2>&1 || { echo "❌ Docker es requerido"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose es requerido"; exit 1; }

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado"
fi

# Levantar servicios con Docker
echo "📦 Levantando servicios con Docker..."
docker-compose up --build -d

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a PostgreSQL..."
sleep 10

# Ejecutar migraciones y seeds
echo "🗃️ Configurando base de datos..."
docker-compose exec rails-api rails db:migrate db:seed

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "📍 URLs de acceso:"
echo "   Frontend:  http://localhost:5173"
echo "   API Rails: http://localhost:3000/api/v1"
echo "   WebSocket: ws://localhost:8080/ws"
echo ""
echo "👤 Usuarios de prueba:"
echo "   - alexandre.icaza@espol.edu.ec / password123"
echo "   - jose.chong@espol.edu.ec / password123"
echo "   - alex.otero@espol.edu.ec / password123"
echo ""
echo "📝 Comandos útiles:"
echo "   docker-compose logs -f        # Ver logs"
echo "   docker-compose down           # Detener servicios"
echo "   docker-compose restart        # Reiniciar servicios"
