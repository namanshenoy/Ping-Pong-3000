# Stage 1
# base image
FROM node:10.16.0 as build

# set working directory
WORKDIR /app/server

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/server/node_modules/.bin:$PATH

# install and cache app dependencies
WORKDIR /app/server
COPY package.json /app/server
COPY package-lock.json /app/server
RUN npm install
RUN npm i socket.io

COPY . /app/server
CMD ["npm", "run", "dev"]