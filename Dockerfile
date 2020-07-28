FROM node:current-alpine3.10
EXPOSE 50222/udp
WORKDIR /usr/app
VOLUME [ "/usr/app/config" ]
COPY package.json .
RUN npm install
COPY . .
ENTRYPOINT [ "node", "index.js" ]