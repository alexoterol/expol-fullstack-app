#!/bin/bash

# Script de inicio rápido para ExPol - Alexandre Icaza
# Este script configura todo automáticamente

echo "🚀 ExPol - Setup Automático"
echo "============================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instala Docker Desktop desde: https://www.docker.com/"
    exit 1
fi

echo -e "${GREEN}✅ Docker detectado${NC}"

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose detectado${NC}"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ No se encuentra docker-compose.yml${NC}"
    echo "Ejecuta este script desde la carpeta expol-marketplace/"
    exit 1
fi

echo -e "${BLUE}📦 Paso 1/5: Construyendo imágenes...${NC}"
docker-compose build
echo ""

echo -e "${BLUE}📦 Paso 2/5: Iniciando PostgreSQL y Redis...${NC}"
docker-compose up -d postgres redis
sleep 10
echo ""

echo -e "${BLUE}📦 Paso 3/5: Instalando dependencias...${NC}"
docker-compose run --rm rails-api bundle install
echo ""

echo -e "${BLUE}📦 Paso 4/5: Configurando base de datos...${NC}"
docker-compose run --rm rails-api rails db:create
docker-compose run --rm rails-api rails db:migrate
docker-compose run --rm rails-api rails db:seed
echo ""

echo -e "${BLUE}📦 Paso 5/5: Iniciando Rails API...${NC}"
docker-compose up -d rails-api
echo ""

echo -e "${GREEN}═══════════════════════════════════${NC}"
echo -e "${GREEN}   ¡Setup completado! 🎉${NC}"

echo -e "${GREEN}═══════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 Servicios disponibles:${NC}"
echo "   • Rails API: http://localhost:3000"
echo "   • PostgreSQL: localhost:5432"
echo "   • Redis: localhost:6379"
echo ""
echo -e "${BLUE}🔑 Credenciales de prueba:${NC}"
echo "   Email: alexandre.icaza@espol.edu.ec"
echo "   Password: password123"
echo ""
echo -e "${BLUE}🧪 Prueba el health check:${NC}"
echo "   curl http://localhost:3000/health"
echo ""
echo -e "${BLUE}📝 Ver logs:${NC}"
echo "   docker-compose logs -f rails-api"
echo ""
echo -e "${BLUE}🛑 Detener servicios:${NC}"
echo "   docker-compose down"
echo ""