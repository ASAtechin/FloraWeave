# Base node image
FROM node:20-alpine

# Install build-time dependencies (for native modules like sharp/canvas-confetti/node-gyp if needed)
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package config files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (ci for strict, reproducible lockfile installation)
RUN npm ci

# Copy remaining source code
COPY . .

# Generate Prisma database client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Production settings
ENV NODE_ENV production
ENV PORT 3000

# Expose port
EXPOSE 3000

# Run server
CMD ["npm", "run", "start"]
