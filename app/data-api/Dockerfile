FROM node:10.9.0-alpine

WORKDIR /usr/src/app
COPY ./app/data-api/package*.json ./
RUN npm ci

COPY . .
ENV NODE_ENV "development"
EXPOSE 3009

CMD [ "npm", "run", "container" ]