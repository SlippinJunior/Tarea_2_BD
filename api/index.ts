import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

const app = new Elysia();
const prisma = new PrismaClient();
const PORT = 3000;

const userRoutes = new Elysia({ prefix: "/api" });

// Iniciar sesión, implementado
userRoutes.post("/login", async ({ body }: { body: any }) => {
  const { correo, clave } = body;
  try {
      const usuario = await prisma.user.findUnique({
          where: { correo },
      });
      if (usuario && usuario.clave === clave) {
          return { estado: 200, mensaje: "Inicio de sesión exitoso"};
      } else {
          return { estado: 401, mensaje: "Credenciales inválidas" };
      }
  } catch (error) {
      console.error(error);
      return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Registrar usuario, implementado
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
    console.log("Usuario registrado");
    return { estado: 200, mensaje: "Se realizó la peticion correctamente" };
  } catch (error) {
    console.error(error);
    return { estado: 500, mesnaje: "Hubo un error al realizar la petición" };
  }
});

// Enviar correo, implementado
userRoutes.post("/enviarcorreo", async ({ body }: { body: { remitenteCorreo: string; destinatarioCorreo: string; asunto: string; contenido: string } }) => {
  const { remitenteCorreo, destinatarioCorreo, asunto, contenido } = body;
  try {
    const remitente = await prisma.user.findUnique({
      where: { correo: remitenteCorreo},
    });

    if (remitente) {
      const destinatario = await prisma.user.findUnique({
        where: { correo: destinatarioCorreo },
      });

      if (destinatario) {
        const nuevoCorreo = await prisma.email.create({
          data: {
            asunto,
            contenido,
            remitenteId: remitente.id,
            destinatarioId: destinatario.id,
            fechaEnvio: new Date(),
          },
        });

        return { estado: 200, mensaje: "Correo enviado exitosamente" };
      } else {
        return { estado: 400, mensaje: "Destinatario no encontrado" };
      }
    } else {
      return { estado: 400, mensaje: "Remitente no encontrado" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Bloquear usuario, implementado
userRoutes.post("/bloquear", async ({ body }: { body: { correo: string; clave: string; correo_bloquear: string } }) => {
  const { correo, clave, correo_bloquear } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (!usuario || usuario.clave !== clave) {
      return { estado: 401, mensaje: "Credenciales inválidas" };
    }

    const usuarioBloquear = await prisma.user.findUnique({
      where: { correo: correo_bloquear }
    });

    if (!usuarioBloquear) {
      return { estado: 400, mensaje: "Usuario a bloquear no encontrado" };
    }

    await prisma.blockedAddress.create({
      data: {
        usuarioId: usuario.id,
        usuarioBloqueadoId: usuarioBloquear.id,
        fechaBloqueo: new Date(),
      },
    });

    return { estado: 200, mensaje: "Usuario bloqueado exitosamente" };

  } catch (error) {
    console.error(error);
    let errorMessage = "Hubo un error al realizar la petición";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { estado: 500, mensaje: errorMessage };
  }
});

// Obtener información pública de cliente, implementado
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

// Marcar como favorito, implementado
userRoutes.post("/marcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
      include: { favoritos: true },
    });

    if (usuario && usuario.clave === clave) {
      const emailFavorito = await prisma.email.findUnique({
        where: { id: id_correo_favorito },
      });

      if (emailFavorito) {
        // Verificar si el correo ya está marcado como favorito por este usuario
        const correoMarcado = usuario.favoritos.some((favEmail) => favEmail.correoFavoritoId === id_correo_favorito);

        if (correoMarcado) {
          return { estado: 400, mensaje: "Correo ya marcado como favorito" };
        }

        await prisma.favoriteEmail.create({
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


// Desmarcar como favorito, implementado
userRoutes.delete("/desmarcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return { estado: 400, mensaje: "Usuario no encontrado" };
    }

    if (usuario.clave !== clave) {
      return { estado: 400, mensaje: "Nombre de usuario o contraseña incorrecta" };
    }

    const favoritoExistente = await prisma.favoriteEmail.findFirst({
      where: {
        usuarioId: usuario.id,
        correoFavoritoId: id_correo_favorito,
      },
    });

    if (!favoritoExistente) {
      return { estado: 400, mensaje: "Correo a desmarcar como favorito no encontrado" };
    }

    await prisma.favoriteEmail.delete({
      where: {
        id: favoritoExistente.id,
      },
    });

    return { estado: 200, mensaje: "Correo eliminado de favoritos exitosamente" };
  } catch (error) {
    console.error("Error al desmarcar correo como favorito:", error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});


// Obtener correos recibidos, implementado
userRoutes.get("/obtenercorreos/:correo", async ({ params }: { params: { correo: string } }) => {
  const { correo } = params;
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo },
      select: { id: true },
    });

    if (!usuario) {
      return { estado: 400, mensaje: "Usuario no encontrado" };
    }

    const correos = await prisma.email.findMany({
      where: { destinatarioId: usuario.id },
      select: { id: true, remitente: { select: { correo: true } }, asunto: true, contenido: true },
    });

    return correos;
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al obtener los correos" };
  }
});

// Obtener correos marcados como favoritos, implementado
userRoutes.get("/correosfavoritos/:correo", async ({ params }: { params: { correo: string } }) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { correo: params.correo },
    });

    if (!usuario) {
      return { estado: 400, mensaje: "Usuario no encontrado" };
    }

    const correosFavoritos = await prisma.favoriteEmail.findMany({
      where: { usuarioId: usuario.id },
      include: { correoFavorito: true },
    });

    const correosFavoritosInfo = correosFavoritos.map((fav) => ({
      id: fav.correoFavorito.id,
      remitente: fav.correoFavorito.remitenteId,
      asunto: fav.correoFavorito.asunto,
      contenido: fav.correoFavorito.contenido,
    }));

    return correosFavoritosInfo;
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});


// Registrar las rutas de usuario en la app principal
app.use(userRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`★ CommuniKen API running on http://localhost:${PORT} ★`);
});
