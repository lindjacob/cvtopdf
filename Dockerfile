# syntax=docker/dockerfile:1

# Use a specific version of Node.js
ARG NODE_VERSION=18.18.0
FROM node:${NODE_VERSION}-slim as base

# Set the working directory in the container
WORKDIR /app

# Set the Node environment to production
ENV NODE_ENV=production

# Install Chromium for Puppeteer
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y chromium && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose port 3000 to the outside once the container is running
EXPOSE 3000

# Set the Puppeteer executable path to the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

# Define the command to run your app
CMD [ "node", "index.js" ]