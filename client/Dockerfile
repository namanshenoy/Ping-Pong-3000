# Stage 1
# base image
FROM node:10.16.0 as build

# set working directory
WORKDIR /app/client

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/client/node_modules/.bin:$PATH

# install and cache app dependencies
WORKDIR /app/client
COPY package.json /app/client
COPY package-lock.json /app/client
RUN npm install

COPY . /app/client
CMD ["npm", "start"]