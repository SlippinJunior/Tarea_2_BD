import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = new Elysia();

// Definir rutas y controladores para consultas básicas

app.get('/users', async (handler) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nombre: true,
      correo: true,
      descripcion: true,
    },
  });
  return handler.json(users);
});

app.get('/users/:id', async (handler: Params) => {
  const userId = parseInt(handler.params.id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nombre: true,
      correo: true,
      descripcion: true,
    },
  });
  if (!user) {
    return handler.notFound('Usuario no encontrado');
  }
  return handler.json(user);
});

// Puedes agregar rutas similares para otras consultas básicas

app.get('/emails', async (handler) => {
  const emails = await prisma.email.findMany({
    select: {
      id: true,
      asunto: true,
      contenido: true,
      fechaEnvio: true,
    },
  });
  return handler.json(emails);
});

// ... (rutas para otras consultas básicas a Email y modelos restantes)

// Iniciar el servidor
app.listen(3000);
