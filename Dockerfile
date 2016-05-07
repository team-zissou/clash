FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

EXPOSE 8080

COPY . /usr/src/app
RUN npm install

CMD ["npm", "start"]
