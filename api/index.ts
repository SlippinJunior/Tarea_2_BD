import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";

const app = new Elysia(); // Crear una instancia de la aplicación Elysia
const prisma = new PrismaClient(); // Crear una instancia de PrismaClient para interactuar con la base de datos
const PORT = 3000; // Definir el puerto en el que se ejecutará la aplicación

const userRoutes = new Elysia({ prefix: "/api" }); // Crear un enrutador de Elysia con prefijo '/api'

// Función para obtener la hora actual en formato 'hora:minuto'
function obtenerHoraActual(): string {
  const fechaActual: Date = new Date();
  const horaActual: string = fechaActual.toLocaleTimeString('es-CL', { hour: 'numeric', minute: 'numeric' });
  return `${horaActual}`;
}

// Ruta para iniciar sesión
userRoutes.post("/login", async ({ body }: { body: any }) => {
  const { correo, clave } = body;
  try {
    const horaActual: string = obtenerHoraActual();
    const usuario = await prisma.user.findUnique({
      where: { correo },
    });
    if (usuario && usuario.clave === clave) {
      console.log(`[${horaActual}] Inicio de sesión exitoso: ${usuario.correo}`);
      return { estado: 200, mensaje: "Inicio de sesión exitoso" };
    } else {
      return { estado: 401, mensaje: "Credenciales inválidas" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Ruta para registrar un usuario
userRoutes.post("/registrar", async ({ body }: { body: { nombre: string; correo: string; clave: string; descripcion: string } }) => {
  const { nombre, correo, clave, descripcion } = body;
  try {
    const horaActual: string = obtenerHoraActual();
    const nuevoUsuario = await prisma.user.create({
      data: {
        nombre,
        correo,
        clave,
        descripcion,
        fechaRegistro: new Date(),
      },
    });
    console.log(`[${horaActual}] Usuario registrado: ${nuevoUsuario.correo}`);
    return { estado: 200, mensaje: "Se realizó la petición correctamente" };
  } catch (error) {
    console.error(error);
    return { estado: 500, mesnaje: "Hubo un error al realizar la petición" };
  }
});

// Ruta para enviar un correo
userRoutes.post("/enviarcorreo", async ({ body }: { body: { remitenteCorreo: string; destinatarioCorreo: string; asunto: string; contenido: string } }) => {
  const { remitenteCorreo, destinatarioCorreo, asunto, contenido } = body;
  try {
    const horaActual: string = obtenerHoraActual();
    const remitente = await prisma.user.findUnique({
      where: { correo: remitenteCorreo },
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

        console.log(`[${horaActual}] Correo de: ${remitenteCorreo} enviado a: ${destinatarioCorreo} exitosamente`);
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

// Ruta para bloquear un usuario
userRoutes.post("/bloquear", async ({ body }: { body: { correo: string; clave: string; correo_bloquear: string } }) => {
  const { correo, clave, correo_bloquear } = body;
  try {
    const horaActual: string = obtenerHoraActual();
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

    console.log(`[${horaActual}] Usuario: ${correo} bloqueó exitosamente a: ${correo_bloquear}`);
    return { estado: 200, mensaje: "Usuario bloqueado exitosamente" };

  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Ruta para obtener información pública de un usuario
userRoutes.get("/informacion/:correo", async ({ params }: { params: { correo: string } }) => {
  try {
    const horaActual: string = obtenerHoraActual();
    const usuario = await prisma.user.findUnique({
      where: { correo: params.correo },
      select: {
        nombre: true,
        correo: true,
        descripcion: true,
      },
    });

    if (usuario) {
      console.log(`[${horaActual}] Se obtuvo información del usuario: ${usuario.correo}`);
      return { ...usuario };
    } else {
      return { estado: 400, mensaje: "Usuario no encontrado" };
    }
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
  }
});

// Ruta para marcar un correo como favorito
userRoutes.post("/marcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const horaActual: string = obtenerHoraActual();
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

        console.log(`[${horaActual}] Usuario: ${correo} marcó el correo: ${id_correo_favorito} como favorito`);
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

// Ruta para desmarcar un correo como favorito
userRoutes.delete("/desmarcarcorreo", async ({ body }: { body: { correo: string; clave: string; id_correo_favorito: number } }) => {
  const { correo, clave, id_correo_favorito } = body;
  try {
    const horaActual: string = obtenerHoraActual();
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

    console.log(`[${horaActual}] Usuario: ${correo} desmarcó el correo: ${id_correo_favorito} de favoritos`);
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

// Ruta para obtener los correos recibidos
userRoutes.get("/obtenercorreos/:correo", async ({ params }: { params: { correo: string } }) => {
  const { correo } = params;
  try {
    const horaActual: string = obtenerHoraActual();
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

    console.log(`[${horaActual}] Se obtuvieron los correos de ${correo}`);
    return correos;
  } catch (error) {
    console.error(error);
    return { estado: 500, mensaje: "Hubo un error al obtener los correos" };
  }
});

// Ruta para obtener los correos marcados como favoritos
userRoutes.get("/correosfavoritos/:correo", async ({ params }: { params: { correo: string } }) => {
  try {
    const horaActual: string = obtenerHoraActual();
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

    console.log(`[${horaActual}] Se obtuvieron los correos favoritos del usuario ${usuario.correo}`);
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
