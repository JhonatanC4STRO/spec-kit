import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// El admin ya no vive en la base de datos: sus credenciales se validan
// directamente contra ADMIN_EMAIL / ADMIN_PASSWORD del entorno.
async function main(): Promise<void> {
  await prisma.estadoInscripciones.upsert({
    where: { juego: "FC25" },
    update: {},
    create: { juego: "FC25", abierta: true },
  });
  await prisma.estadoInscripciones.upsert({
    where: { juego: "COD_BO2" },
    update: {},
    create: { juego: "COD_BO2", abierta: true },
  });
}

main()
  .catch((error: unknown): void => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });
