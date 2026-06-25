# Use official lightweight Node.js image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Expose the port (Cloud Run sets the PORT env variable dynamically)
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
