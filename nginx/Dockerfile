# Use the official Nginx base image
FROM nginx:latest

# Set the working directory
WORKDIR /app
# Set correct ownership and permissions
RUN mkdir -p /app/staticfiles && \
    chown -R nginx:nginx /app/staticfiles && \
    chmod -R 755 /app/staticfiles

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
