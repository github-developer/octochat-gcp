FROM node:12
RUN apt-get update -y && apt-get upgrade -y

WORKDIR /usr/src/app
RUN mkdir .data

COPY ./app/package*.json ./
RUN npm i --only=production

# Bundle app source
COPY app .

CMD ["node", "server.js"]
