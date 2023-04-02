FROM node:16 AS build
WORKDIR /app

# install and cache app dependencies
COPY package.json package.json

RUN npm install
RUN npm install -g @angular/cli

COPY . /app

ENV GENERATE_SOURCEMAP false

RUN ng build --prod --output-path dist

FROM nginx:alpine as ngi

COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/deploy/90-envsubst-on-webui.sh /docker-entrypoint.d/90-envsubst-on-webui.sh
COPY .docker/nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80