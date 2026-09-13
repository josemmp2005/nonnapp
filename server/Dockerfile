# --- build: compila TypeScript a dist/ ---
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime: solo dependencias de producción + dist compilado ---
# node:22-slim (Debian/glibc) en vez de -alpine: bcrypt tiene un binario nativo
# y sus prebuilds no siempre cubren musl/Alpine; evita compilarlo desde cero.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY src/schema.sql ./dist/schema.sql

EXPOSE 3001
CMD ["node", "dist/index.js"]
