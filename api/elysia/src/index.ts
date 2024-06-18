import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

const app = new Elysia();
const prisma = new PrismaClient();

// Registrar usuario
app.post("/api/registrar", async ({ body }: { body: any}) => {
  const {nombre, correo, clave, descripcion} = body;
  try {
    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        correo,
        clave,
        descripcion,
      },
    });
    return {estado: 200, mensaje: "Se realizp la peticion correctamente"};
  } catch (error) {
    console.error(error)
    return {estado: 500, mesnaje: "Hubo un error al realizar la petición"};
  }
});

// Bloquear usuario
app.post("/api/bloquear", async ({ body }: { body:any }) => {
  const {correo, clave, correo_bloquear} = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: {correo},
    });
    if (usuario && usuario.clave === clave) {
      const usuarioBloquear = await prisma.user.findUnique({
        where: {correo: correo_bloquear}
      });
      if (usuarioBloquear) {
        await prisma.blockedAddress.create({
          data: {
            usuarioId: usuario.id,
            usuarioBloqueadoId: usuarioBloquear.id,
          },
        });
        return {estado:200, mensaje: "Usuario bloqueado exitosamente"};
      } else {
        return {estado: 400, mensaje: "Usuario a bloquear no encontrado"};
      }
    } else {
      return {estado: 400, mensaje: "Nombre de usuario o clave incorrecta"};
    }
  } catch (error) {
    console.error(error)
    return {estado: 500, mensaje: "Hubo un error al realizar la petición"};
  }
});

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
