FROM node:6.1

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app
EXPOSE 8080
CMD ["npm", "start"]
