# Multi-stage build for order-service (Node.js GraphQL)
# Stage 1: Dependencies
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install dependencies with clean install for production
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Remove unnecessary files
RUN rm -rf tests/ docs/ *.md .git/

# Stage 3: Production
FROM node:18-alpine AS production

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code from build stage
COPY --from=build --chown=nodejs:nodejs /app/index.js ./
COPY --from=build --chown=nodejs:nodejs /app/package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "index.js"]