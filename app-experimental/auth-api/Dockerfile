FROM node:12.16.0-alpine

WORKDIR /usr/src/app
COPY src/package*.json ./
RUN npm install

COPY src/ .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]