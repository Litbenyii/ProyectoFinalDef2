const { prisma } = require("../config/prisma");
const { getStudentByUserId } = require("../services/student.service");
const {
  createApplication,
  getMyRequests,
} = require("../services/application.service");
const {
  createPracticeRequest,
} = require("../services/practice.service");

//lista de oferta activas
async function getOffers(req, res) {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(offers);
  } catch (error) {
    console.error("Error en getOffers:", error);
    return res.status(500).json({ message: "Error al obtener ofertas" });
  }
}

// postulacione y solicitudes externas
async function getMyRequestsController(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const result = await getMyRequests(student.id);
    return res.json(result);
  } catch (error) {
    console.error("Error en getMyRequests:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener tus solicitudes" });
  }
}

//crear solicitud de practica externa
async function createPracticeRequestController(req, res) {
  try {
    const student = await getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const created = await createPracticeRequest(student.id, req.body);
    return res.status(201).json(created);
  } catch (error) {
    console.error("Error en createPracticeRequest:", error);
    return res
      .status(500)
      .json({ message: "Error al crear solicitud de práctica externa" });
  }
}

//postula a una oferta
async function createApplicationController(req, res) {
  try {
    const offerId = Number(req.params.offerId);
    if (Number.isNaN(offerId)) {
      return res.status(400).json({ message: "ID de oferta inválido" });
    }

    const student = await getStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Estudiante no encontrado" });
    }

    const app = await createApplication(student.id, offerId);
    return res.status(201).json(app);
  } catch (error) {
    console.error("Error en createApplication:", error);
    return res
      .status(500)
      .json({ message: error.message || "Error al postular a la oferta" });
  }
}

module.exports = {
  getOffers,
  getMyRequestsController,
  createPracticeRequestController,
  createApplicationController,
};
