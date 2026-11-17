# Node 22 LTS (node 16 ya no tiene soporte y las dependencias de compilación piden node 18 o posterior).
# El webpack 4 de Angular 11 usa md4: con OpenSSL 3 necesita el proveedor legacy.
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NODE_OPTIONS=--openssl-legacy-provider

# install and cache app dependencies (exactamente las del yarn.lock)
COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

COPY . /app

RUN yarn build --configuration=production --output-path dist

FROM nginx:alpine as ngi

COPY --from=build /app/dist /usr/share/nginx/html
COPY .docker/deploy/90-envsubst-on-webui.sh /docker-entrypoint.d/90-envsubst-on-webui.sh
COPY .docker/nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80
