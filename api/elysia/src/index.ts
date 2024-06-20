import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

const app = new Elysia();
const prisma = new PrismaClient();
const PORT = 3000;

const userRoutes = new Elysia({ prefix: "/api" });

// Registrar usuario
userRoutes.post("/registrar", async ({ body }: { body: { nombre: string; correo: string; clave: string; descripcion: string } }) => {
  const { nombre, correo, clave, descripcion } = body;
  try {
    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        correo,
        clave,
        descripcion,
        fechaRegistro: new Date(),
      },
    });
    return { estado: 200, mensaje: "Se realizó la peticion correctamente" };
  } catch (error) {
    console.error(error);
    return { estado: 500, mesnaje: "Hubo un error al realizar la petición" };
  }
});

// Bloquear usuario
userRoutes.post("/bloquear", async ({ body }: { body: { correo: string; clave: string; correo_bloquear: string } }) => {
  const { correo, clave, correo_bloquear } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (usuario && usuario.clave === clave) {
      const usuarioBloquear = await prisma.user.findUnique({
        where: { correo: correo_bloquear }
      });
      if (usuarioBloquear) {
        await prisma.blockedAddress.create({
          data: {
            usuarioId: usuario.id,
            usuarioBloqueadoId: usuarioBloquear.id,
            fechaBloqueo: new Date(),
          },
        });
        return { estado: 200, mensaje: "Usuario bloqueado exitosamente" };
      } else {
        return { estado: 400, mensaje: "Usuario a bloquear no encontrado" };
      }
    } else {
      return { estado: 400, mensaje: "Nombre de usuario o clave incorrecta" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Obtener información pública de cliente
userRoutes.get("/informacion/:correo", async ({ params }: { params: { correo: string } }) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo: params.correo },
      select: {
        nombre: true,
        correo: true,
        descripcion: true,
      },
    });

    if (usuario) {
      return { ...usuario };
    } else {
      return { estado: 400, mensaje: "Usuario no encontrado" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Marcar como favorito
userRoutes.post("/marcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (usuario && usuario.clave === clave) {
      const emailFavorito = await prisma.email.findUnique({
        where: { id: id_correo_favorito }
      });

      if (emailFavorito) {
        await prisma.favoriteAddress.create({
          data: {
            usuarioId: usuario.id,
            correoFavoritoId: id_correo_favorito,
            fechaMarcado: new Date(),
          },
        });
        
        return { estado: 200, mensaje: "Correo marcado como favorito exitosamente" };
      } else {
        return { estado: 400, mensaje: "Correo a marcar como favorito no encontrado" };
      }
    } else {
      return { estado: 400, mensaje: "Nombre de usuario o contraseña incorrecta" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Desmarcar como favorito
userRoutes.delete("/desmarcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (usuario && usuario.clave === clave) {
      const favoritoExistente = await prisma.favoriteAddress.findFirst({
        where: {
          usuarioId: usuario.id,
          correoFavoritoId: id_correo_favorito,
        },
      });

      if (favoritoExistente) {
        await prisma.favoriteAddress.delete({
          where: {
            id: favoritoExistente.id,
          },
        });

        return { estado: 200, mensaje: "Correo eliminado de favoritos exitosamente" };
      } else {
        return { estado: 400, mensaje: "Correo a desmarcar como favorito no encontrado" };
      }
    } else {
      return { estado: 400, mensaje: "Nombre de usuario o contraseña incorrecta" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Registrar las rutas de usuario en la app principal
app.use(userRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🦊 Elysia is running at http://localhost:${PORT}`);
});

