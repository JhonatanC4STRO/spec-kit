import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Datos de prueba: 32 jugadores FC25 con documento y apodo únicos.
 * Correr con:  npx ts-node prisma/seed-fc25.ts
 * Es repetible: skipDuplicates ignora los que ya existan.
 */
const CANTIDAD = 32;

const NOMBRES = [
  "Juan", "Carlos", "Andrés", "Felipe", "Santiago", "Sebastián", "David",
  "Mateo", "Nicolás", "Samuel", "Daniel", "Alejandro", "Diego", "Miguel",
  "Ángel", "Cristian", "Julián", "Esteban", "Camilo", "Óscar",
];
const APELLIDOS = [
  "Gómez", "Rodríguez", "Martínez", "López", "García", "Pérez", "Sánchez",
  "Ramírez", "Torres", "Flórez", "Castro", "Rojas", "Vargas", "Moreno",
  "Jiménez", "Muñoz",
];

function normalizar(texto: string): string {
  return texto.trim().toLowerCase();
}

async function main(): Promise<void> {
  // Asegura que las inscripciones FC25 estén abiertas
  await prisma.estadoInscripciones.upsert({
    where: { juego: "FC25" },
    update: {},
    create: { juego: "FC25", abierta: true },
  });

  const filas: Prisma.InscripcionCreateManyInput[] = [];

  for (let i = 1; i <= CANTIDAD; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const apellido = APELLIDOS[i % APELLIDOS.length];
    const nickname = `player_${String(i).padStart(2, "0")}`;
    const documento = `1000${String(1000 + i).padStart(6, "0")}`;

    filas.push({
      nombreCompleto: `${nombre} ${apellido}`,
      nickname,
      nicknameNormalizado: normalizar(nickname),
      documento,
      ficha: `27${String(10000 + i)}`,
      programa: "ADSO",
      correo: `${nickname}@test.sena.edu.co`,
      telefono: `31000000${String(i).padStart(2, "0")}`,
      juego: "FC25",
    });
  }

  const resultado = await prisma.inscripcion.createMany({
    data: filas,
    skipDuplicates: true,
  });

  console.log(`Jugadores FC25 insertados: ${resultado.count} (de ${CANTIDAD} solicitados)`);
}

main()
  .catch((error: unknown): void => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });
