FROM node:14 AS build
WORKDIR /app

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli

COPY . /app

ENV NODE_OPTIONS --max_old_space_size=4096
ENV GENERATE_SOURCEMAP false

RUN ng build --prod --output-path dist

FROM nginx:1.23.3-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]