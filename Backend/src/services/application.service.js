const { prisma } = require("../config/prisma");

// postuacion a ofeerta una vez
async function createApplication(studentId, offerId) {

  const existing = await prisma.application.findFirst({
    where: { studentId, offerId },
  });

  if (existing) {
    throw new Error("Ya postulaste a esta oferta.");
  }

  const app = await prisma.application.create({
    data: {
      studentId,
      offerId,
      status: "PEND_EVAL",
    },
    include: {
      offer: true,
      student: {
        include: { user: true },
      },
    },
  });

  return app;
}

//solicitudes y postulaciones
async function getMyRequests(studentId) {
  const applications = await prisma.application.findMany({
    where: { studentId },
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });

  const practices = await prisma.practiceRequest.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return {
    applications,
    practices,
  };
}

//lista de postulaciones
async function getCoordinatorApplications() {
  return prisma.application.findMany({
    include: {
      offer: true,
      student: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

//estado de postulacion
async function updateApplicationStatus(id, status) {
  const app = await prisma.application.update({
    where: { id },
    data: { status },
  });

  return app;
}

module.exports = {
  createApplication,
  getMyRequests,
  getCoordinatorApplications,
  updateApplicationStatus,
};
