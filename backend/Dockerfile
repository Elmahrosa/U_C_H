FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN addgroup -g 1001 -S uchapp && \
    adduser -S uchapp -u 1001 && \
    mkdir -p /app/logs && \
    chown -R uchapp:uchapp /app

USER uchapp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "index.js"]
