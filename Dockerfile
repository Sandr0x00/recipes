FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apk add python3

RUN npm install

# Bundle app source
COPY . .

RUN npm rebuild node-sass
RUN npm run build
# If you are building your code for production
# RUN npm ci --only=production


EXPOSE 8080
CMD [ "npm", "run", "start" ]