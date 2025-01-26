# Use the latest Node.js 22 official image as the base
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./

# Use a build argument to set NODE_ENV (default to production)
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies based on the environment
RUN if [ "$NODE_ENV" = "development" ]; \
    then yarn install; \
    else yarn install --production; \
    fi

# Copy the rest of the application files
COPY . .

# Expose the port that your app will run on
EXPOSE 8080

# Command to run the application
CMD ["node", "app.js"]
