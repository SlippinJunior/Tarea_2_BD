##############################################################################

Integrantes:

Baltazar Portilla - 202173112-1
Ivan Papic - 202273028-5

Para ejecutar la tarea:

1.- Instalar requirements.txt

Desde la carpeta del proyecto, ejecutar el comando

pip install -r api/requirements.txt

2.- Configurar el DB_USER en el archivo api/.env para conectar al servidor,
en caso que el servidor tenga contrasena agragarla al url despues del DB_USER.

3.- Desde la carpeta api, ejecutar:

bun install
bun prisma db push

Para instalar dependencias y crear la base de datos.

4.- Ejecutar el API, desde la carpeta api, ejecutar el comando:

bun start

5.- Acceder al cliente, ejecutar clien/cliente.py 

Desde la carpeta del proyecto ejecutar:

python client/cliente.py 


##############################################################################
