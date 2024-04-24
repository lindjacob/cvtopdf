# Use a specific version of Node.js
ARG NODE_VERSION=18.18.0
FROM node:${NODE_VERSION}-slim as base

# Set the working directory in the container
WORKDIR /app

# Set the Node environment to production
ENV NODE_ENV=production

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and necessary libraries
RUN apt-get update && apt-get install -y wget gnupg && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose port 3000 to the outside once the container is running
EXPOSE 3000

# Set the Puppeteer executable path to the installed Google Chrome
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Define the command to run your app
CMD [ "node", "index.js" ]