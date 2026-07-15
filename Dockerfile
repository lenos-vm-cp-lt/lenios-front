FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install Angular CLI globally matching project version
RUN npm install -g @angular/cli@19.0.2

# Copy package files for caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy source code
COPY . .

# Expose standard Angular dev port
EXPOSE 4200

# Command to serve the application in dev mode, bound to all network interfaces
CMD ["ng", "serve", "--host", "0.0.0.0"]
