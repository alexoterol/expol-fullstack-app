FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

EXPOSE 5173

# Usar vite dev server con host 0.0.0.0 para que sea accesible fuera del container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
