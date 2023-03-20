FROM node:14-alpine AS build
WORKDIR /app

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm cache clean --force

RUN npm install
RUN npm install -g @angular/cli

COPY . /app

RUN ng build --prod --output-path dist

FROM nginx:latest as ngi

COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/deploy/90-envsubst-on-webui.sh /docker-entrypoint.d/90-envsubst-on-webui.sh
COPY .docker/nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80