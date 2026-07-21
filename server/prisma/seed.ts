import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// En producción se definen ADMIN_EMAIL y ADMIN_PASSWORD por entorno;
// sin ellas se usan las credenciales de desarrollo.
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL ?? "admin@torneo.com";
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD ?? "admin123";

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

  const passwordHash: string = await bcrypt.hash(ADMIN_PASSWORD, 10);
  // update incluye el hash para poder rotar la contraseña re-ejecutando el seed
  await prisma.administrador.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: { email: ADMIN_EMAIL, passwordHash },
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
