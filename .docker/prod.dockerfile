FROM node:14 AS build
WORKDIR /app

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli

COPY . /app

RUN ng build --prod --output-path dist

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/deploy/90-envsubst-on-webui.sh /docker-entrypoint.d/90-envsubst-on-webui.sh