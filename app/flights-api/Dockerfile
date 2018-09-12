FROM node:10.9.0-alpine

WORKDIR /usr/src/app
COPY ./app/flights-api/package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV "development"
EXPOSE 3003

CMD [ "npm", "run", "container" ]