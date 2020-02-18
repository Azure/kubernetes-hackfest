FROM node:12.16.0-alpine

WORKDIR /usr/src/app
RUN npm -g config set user root
RUN npm -g install artillery
ENV load_duration 1
ENV load_rate 1
ENV load_url google.com

COPY . .
ENTRYPOINT artillery quick -d ${load_duration} -r ${load_rate} http://${load_url}


