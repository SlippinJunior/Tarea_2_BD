import { Elysia } from "elysia";
import { PrismaClient } from "@prisma/client";
const app = new Elysia();
const prisma = new PrismaClient();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🦊 Elysia is running at http://localhost:${PORT}`);
});
// Registrar usuario
app.post("/api/registrar", async ({ body }) => {
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
        return { estado: 200, mensaje: "Se realizp la peticion correctamente" };
    }
    catch (error) {
        console.error(error);
        return { estado: 500, mesnaje: "Hubo un error al realizar la petición" };
    }
});
// Bloquear usuario
app.post("/api/bloquear", async ({ body }) => {
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
            }
            else {
                return { estado: 400, mensaje: "Usuario a bloquear no encontrado" };
            }
        }
        else {
            return { estado: 400, mensaje: "Nombre de usuario o clave incorrecta" };
        }
    }
    catch (error) {
        console.error(error);
        return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
    }
});
// Obtener información pública de cliente
app.get("/api/informacion/:correo", async ({ params }) => {
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
        }
        else {
            return { estado: 400, mensaje: "Usuario no encontrado" };
        }
    }
    catch (error) {
        console.error(error);
        return { estado: 500, mensaje: "Hubo un error al realizar la petición" };
    }
});
// Marcar como favorito
app.post("/api/marcarcorreo", async ({ body }) => {
    const { correo, clave, id_correo_favorito } = body;
    try {
        const usuario = await prisma.user.findUnique({
            where: { correo },
        });
        if (usuario && usuario.clave === clave) {
            const usuarioFavorito = await prisma.user.findUnique({
                where: { id: id_correo_favorito }
            });
            if (usuarioFavorito) {
                await prisma.favoriteAddress.create({
                    data: {
                        usuarioId: usuario.id,
                        correoFavoritoId: usuarioFavorito.id,
                        fechaMarcado: new Date()
                    },
                });
                return { estado: 200, mensaje: "Usuario añadido a favoritos exitosamente" };
            }
            else {
                return { estado: 400, mensaje: "Usuario a añadir a favoritos no encontrado" };
            }
        }
        else {
            return { estado: 400, mensaje: "Nombre de usuario o contraseña incorrecta" };
        }
    }
    catch (error) {
        console.error(error);
        return { estado: 400, mensaje: "Hubo un error al realizar la petición" };
    }
});
// Desmarcar como favorito
app.delete("/api/desmarcarcorreo", async ({ body }) => {
    const { correo, clave, id_correo_favorito } = body;
    try {
        const usuario = await prisma.user.findUnique({
            where: { correo },
        });
        if (usuario && usuario.clave === clave) {
            const usuarioFavorito = await prisma.user.findUnique({
                where: { id: id_correo_favorito }
            });
            if (usuarioFavorito) {
                await prisma.favoriteAddress.deleteMany({
                    where: {
                        usuarioId: usuario.id,
                        correoFavoritoId: usuarioFavorito.id,
                    },
                });
                return { estado: 200, mensaje: "Usuario eliminado de favoritos exitosamente" };
            }
            else {
                return { estado: 400, mensaje: "Usuario a eliminar no encontrado" };
            }
        }
        else {
            return { estado: 400, mensaje: "Nombre de usuario o contraseña incorrecta" };
        }
    }
    catch (error) {
        console.error(error);
        return { estado: 400, mensaje: "Hubo un error al realizar la petición" };
    }
});
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
