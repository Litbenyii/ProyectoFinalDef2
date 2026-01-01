const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de base de datos...");

  // Borrar todo en orden de dependencias
  await prisma.application.deleteMany();
  await prisma.practiceRequest.deleteMany();
  await prisma.practice.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.evaluator.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // Usuarios
  const coordPassword = await bcrypt.hash("Admin123", 10);
  const studentPassword = await bcrypt.hash("123456", 10);

  const coordUser = await prisma.user.create({
    data: {
      name: "Coordinador Prácticas",
      email: "admin@uni.cl",
      password: coordPassword,
      role: "COORDINATION",
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      name: "Alumno Prueba",
      email: "alumno@uni.cl",
      password: studentPassword,
      role: "STUDENT",
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      rut: "21.783.667-0",
      career: "Ing. Informática",
    },
  });

  const evaluator = await prisma.evaluator.create({
    data: {
      name: "Docente Evaluador",
      email: "docente@ubb.cl",
    },
  });

  // Ofertas
  const offer1 = await prisma.offer.create({
    data: {
      title: "Práctica Desarrollador Frontend",
      company: "TechNova SpA",
      location: "Concepción",
      hours: 320,
      modality: "Híbrida",
      details:
        "Apoyo en desarrollo web, mantención de equipos y soporte a usuarios internos.",
      deadline: new Date("2025-12-29"),
      startDate: null,
    },
  });

  const offer2 = await prisma.offer.create({
    data: {
      title: "Práctica Desarrollador Web",
      company: "Empresa Demo",
      location: "Concepción",
      hours: 320,
      modality: "Híbrida",
      details: "Stack JS, modalidad híbrida.",
      deadline: new Date("2025-12-29"),
      startDate: null,
    },
  });

  // Postulaciones internas
  await prisma.application.create({
    data: {
      studentId: student.id,
      offerId: offer1.id,
      status: "PEND_EVAL",
    },
  });

  await prisma.application.create({
    data: {
      studentId: student.id,
      offerId: offer2.id,
      status: "PEND_EVAL",
    },
  });

  // Solicitud de practica externa
  await prisma.practiceRequest.create({
    data: {
      studentId: student.id,
      companyName: "Innovatech Solutions Ltda.",
      tutorName: "Carlos Muñoz",
      tutorEmail: "carlos.munoz@innovatech.cl",
      startDate: new Date("2026-01-02"),
      endDate: new Date("2026-04-30"),
      details: "Desarrollo de soluciones internas para el área TI.",
      status: "PEND_EVAL",
    },
  });

  // Práctica abierta asociada al estudiante (para el módulo de evaluadores)
  await prisma.practice.create({
    data: {
      studentId: student.id,
      type: "EXTERNAL",
      company: "Innovatech Solutions Ltda.",
      startDate: new Date("2026-01-02"),
      endDate: new Date("2026-04-30"),
      hours: 320,
      status: "OPEN",
      evaluatorId: evaluator.id,
    },
  });

  console.log("Seed completado:");
  console.log("- Usuario coordinación:", coordUser.email, "/ clave: Admin123");
  console.log("- Usuario estudiante:", studentUser.email, "/ clave: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
