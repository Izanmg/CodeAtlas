# Contexto de build: la carpeta aplicacion/ (para incluir backend/ + ia-doc/).
# Construir con:  docker build -f backend/Dockerfile -t <imagen> .   (desde aplicacion/)
FROM node:20-slim

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src

# El bot lee la guia de IA en aplicacion/ia-doc (paralela a backend/).
# En el contenedor queda en /app/ia-doc, que es donde el codigo la resuelve.
COPY ia-doc /app/ia-doc

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
