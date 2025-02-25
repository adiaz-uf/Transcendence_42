# Use Node.js official lightweight image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose port 5000 for WebSocket connections
EXPOSE 5000

# Start the WebSocket server
CMD ["node", "server.js"]
