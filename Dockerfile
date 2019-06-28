# Stage 1
# base image
FROM node:10.16.0 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
WORKDIR /app
COPY . ./
COPY package.json /app/package.json
RUN npm install -g react-scripts@3.0.1
RUN npm install
RUN npm run build

# Stage 2 - the production environment
FROM nginx:latest
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]