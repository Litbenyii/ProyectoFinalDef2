const { prisma } = require("../config/prisma");

//crear solicitud prac externa
async function createPracticeRequest(studentId, payload) {
  const {
    companyName,
    tutorName,
    tutorEmail,
    startDate,
    endDate,
    details,
  } = payload;

  const req = await prisma.practiceRequest.create({
    data: {
      studentId,
      companyName,
      tutorName,
      tutorEmail,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      details: details || "",
      status: "PEND_EVAL",
    },
  });

  return req;
}

//practicas externas
async function getCoordinatorPracticeRequests() {
  return prisma.practiceRequest.findMany({
    include: {
      student: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

//actualizar estado de solicitudes
async function updatePracticeRequestStatus(id, status) {
  return prisma.practiceRequest.update({
    where: { id },
    data: { status },
  });
}

//lista de practicas abiertas
async function getOpenPractices() {
  return prisma.practice.findMany({
    where: { status: "OPEN" },
    include: {
      student: {
        include: { user: true },
      },
      evaluator: true,
    },
  });
}

//lista de evaluadores
async function getEvaluators() {
  return prisma.evaluator.findMany({
    orderBy: { name: "asc" },
  });
}

//asignar evaluador de practica
async function assignEvaluatorToPractice(practiceId, evaluatorId) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: {
      evaluatorId,
    },
    include: {
      student: {
        include: { user: true },
      },
      evaluator: true,
    },
  });
}

//cerrar practica
async function closePractice(practiceId) {
  return prisma.practice.update({
    where: { id: practiceId },
    data: { status: "CLOSED" },
  });
}

module.exports = {
  createPracticeRequest,
  getCoordinatorPracticeRequests,
  updatePracticeRequestStatus,
  getOpenPractices,
  getEvaluators,
  assignEvaluatorToPractice,
  closePractice,
};
