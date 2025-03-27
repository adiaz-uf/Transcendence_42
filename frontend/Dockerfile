# Build stage
FROM node:alpine AS build

# Install PNPM globally using npm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy dependency management files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with PNPM, using frozen lockfile for reproducibility
RUN pnpm install 
# --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React application
RUN pnpm run build

# Final stage
FROM node:alpine

# Install serve directly with npm (no need for PNPM here)
RUN npm install -g serve

# Set the working directory
WORKDIR /app

# Copy the build directory from the previous stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Command to start serve
CMD ["serve", "-s", "build"]
