FROM node:current-alpine3.10
EXPOSE 50222/udp
WORKDIR /usr/app
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT [ "node", "index.js" ]