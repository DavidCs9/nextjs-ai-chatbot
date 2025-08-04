FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ gcc libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Start command
CMD ["sh", "-c", "pnpm db:migrate && pnpm start"]

EXPOSE 3000
