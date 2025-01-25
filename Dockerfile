# Use the latest Node.js 22 official image as the base
FROM node:22

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies using Yarn
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the rest of the application files
COPY . .

# Expose the port that your app will run on
EXPOSE 8080

# Command to run the application
CMD ["node", "app.js"]
