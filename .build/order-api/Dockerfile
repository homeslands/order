# Use the official Node.js image as the base image
FROM node:18-bookworm

RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libxshmfence1 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build


# Expose the application port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]