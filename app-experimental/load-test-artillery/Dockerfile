FROM node:12.16.0-alpine

WORKDIR /usr/src/app
COPY *.yaml ./
RUN npm -g config set user root
RUN npm -g install artillery

COPY . .

CMD [ "artillery", "run", "data-api-load.yaml" ]