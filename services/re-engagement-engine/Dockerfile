# Multi-stage build for Re-engagement Engine
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S qylon -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=qylon:nodejs /app/dist ./dist
COPY --from=builder --chown=qylon:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=qylon:nodejs /app/package*.json ./

# Switch to non-root user
USER qylon

# Expose port
EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3009/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
