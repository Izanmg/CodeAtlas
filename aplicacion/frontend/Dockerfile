# --- build stage ---
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# En produccion el frontend habla con el backend a traves de /api
# (Nginx hace de proxy). Vite (modo production) lee .env.production.
RUN echo "VITE_API_URL=/api" > .env.production
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
