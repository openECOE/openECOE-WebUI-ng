# Configuración del entorno

## Requisitos
- [Visual Studio Code](https://code.visualstudio.com/)
- [node 16.20.2](https://nodejs.org/en/download/package-manager)
- [yarn](https://classic.yarnpkg.com/lang/en/docs/install/)

## Instalación
```
yarn install
```

## Lanzamiento
```
yarn run start
```

O si se quiere utilizar el modo debug en Visual Studio Code utilizar `Run and Debug (CTRL + Shift + D)` y lanzar `ng serve`

> Si se quiere utilizar otro navegador que no sea Google Chrome con el modo debug, cambiar la propiedad `"type"` en [launch.json](./.vscode/launch.json)

## Construir imágen de la Web

En el caso de haber realizado cambios y querer tener estos actualizados en el contenedor habrá que construir la imágen de la Web utilizando el script [build.sh](.docker/build.sh) o bien utilizando el comando manualmente:

```docker
docker build -t "openecoe/webui:<NOMBRE_TAG>" .
```
