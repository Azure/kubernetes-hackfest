FROM node:10.9.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

CMD [ "node", "app.js" ]