# Use the official Node.js image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Define build-time arguments (ARG)
ARG NEXT_PUBLIC_API_URL

# Set environment variables (ENV) for the container runtime
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js app with environment variables
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]