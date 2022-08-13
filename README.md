# Facubot Resurrected
Bot para el discord de la facultad. Utilizamos el mismo para resolver un problema común: **pedir parciales, finales, resúmenes, etc**. \
Cada usuario del servidor puede agregar y pedir estos recursos. Todos los datos se guardan en SQLite, que nos brinda libertad a la hora de hacer queries o guardar datos. \
De esta manera evitamos el trabajo de preguntar, enviar y buscar archivos y lo automatizamos.

## Cómo correrlo
Con Docker:
```
docker build -t facubot .
docker run --init -d facubot
```
Con Node.js ^16.4.0:
```ubuntu
sudo apt install sqlite3
npm install
node .
```

Para que el bot loguee correctamente se debe crear un archivo `config.json` especificando `clientId`, `guildId` y `token` (obtenidos al crear el bot en la [seccion de desarrolladores de Discord](https://discord.com/developers/applications)).

## Roadmap
- [x] Agregar `/parcial` y `/final`
- [x] Agregar `/registrar_parcial` y `/registrar_final`
- [ ] Agregar funcionalidad de resúmenes -> `/resumen` y `/registrar_resumen`
- [x] Mostrar todos los finales y examenes al hacer una query
- - ~~[ ] Interacción con el usuario con botones~~

## Funcionalidades
Se cuenta con diferentes comandos
- `/parcial [materia]`: te devuelve un parcial al azar de la materia especificada.
- `/final [materia] [año (opcional)]`: te devuelve un final al azar de la materia especificada, o uno del año dado.
- `/registrar_parcial [materia] [archivo]`: registra un parcial en la base de datos.
- `/registrar_final [materia] [archivo] [año (opcional)]`: registra un final en la base de datos.

## Modelo general
* Todas las materias se guardan en la base de datos, cosa que cuando se quiera agregar un archivo simplemente se pasa un nombre y el sistema automáticamente determinará de qué registro se habla.
* Los archivos no se guardan como tal, sino que se guarda el URL perteneciente al CDN de Discord que contiene el archivo. De esta manera nos ahorramos espacio en la BD. Al ser archivos livianos (usualmente PDFs, DOCs, GZIP), no hay deterioro del coste de ejecución buscar y enviar el archivo.

## Cómo expandirlo
Dependiendo de lo que se quiera agregar, se deberán crear archivos dentro de `commands`, `events` y `models` para comandos, eventos y tablas, respectivamente. \
Particularmente, luego de agregar un comando nuevo se debe correr `deploy_commands.js` para registrar el comando en la API de Discord.
Por el contrario, si se quiere eliminar un comando, se debe pasar el ID del mismo en `delete_command.js` y correrlo.
