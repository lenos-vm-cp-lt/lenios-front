# Etapa 1: development
FROM node:20-alpine AS development

# Directorio de trabajo interno
WORKDIR /app

# Instalar Angular CLI globalmente (versión 19.0.2)
RUN npm install -g @angular/cli@19.0.2

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código del proyecto
COPY . .

# Exponer el puerto estándar de Angular
EXPOSE 4200

# Levantar el servidor de desarrollo
CMD ["ng", "serve", "--host", "0.0.0.0"]

# Etapa 2: build
FROM development AS build

# Compilación de producción
RUN npx ng build --configuration production
