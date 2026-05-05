# ── Stage 1: Build ──
FROM node:22-alpine AS frontend-build
WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Copy source and build
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN npm run build

# ── Stage 2: Serve with Nginx ──
FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
