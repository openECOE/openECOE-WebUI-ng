FROM node:16 AS build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --prod

FROM nginx
COPY --from=build /app/dist/openECOE-WebUI-ng /usr/share/nginx/html

