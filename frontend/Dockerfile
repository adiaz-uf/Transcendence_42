# Use the latest LTS version of Node.js
FROM node:22-alpine
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .
 
# Build the React application
RUN npm run build && npm install -g serve

# Expose the port your app runs on
EXPOSE 3000
 
# Serve the built React app
CMD ["serve", "-s", "build"]
# Running the dev server
#CMD ["npm", "start"]
