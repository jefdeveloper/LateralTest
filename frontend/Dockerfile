FROM node:24.12-alpine AS builder
WORKDIR /app

# Pin Node minor version to reduce variability between builds
COPY package*.json ./
RUN npm ci --silent --no-audit --no-fund

COPY . .

# Allow injecting the API base URL at build time so the bundled app points to the correct backend
# Use empty default so the app will call relative URLs (e.g. /tasks)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build --silent

FROM nginx:1.26-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Simple healthcheck: ensures the built files are present in the web root
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD test "$(ls /usr/share/nginx/html | wc -l)" -gt 0 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]