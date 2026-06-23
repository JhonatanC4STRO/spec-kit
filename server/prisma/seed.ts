import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ADMIN_EMAIL_PRUEBA = "admin@torneo.com";
const ADMIN_PASSWORD_PRUEBA = "admin123";

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

  const passwordHash: string = await bcrypt.hash(ADMIN_PASSWORD_PRUEBA, 10);
  await prisma.administrador.upsert({
    where: { email: ADMIN_EMAIL_PRUEBA },
    update: {},
    create: { email: ADMIN_EMAIL_PRUEBA, passwordHash },
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
