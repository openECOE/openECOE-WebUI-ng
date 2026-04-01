FROM node:16 AS dev
WORKDIR /app

# instalar dependencias
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
RUN yarn global add @angular/cli@11

# copia el código
COPY . /app

# exponer el puerto del servidor Angular
EXPOSE 4200

# comando para desarrollo
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll=2000"]
