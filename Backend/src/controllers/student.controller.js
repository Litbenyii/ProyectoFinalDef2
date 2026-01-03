const { getStudentByUserId, hasActivePractice, hasPendingExternalRequest } = require("../services/student.service");
const { listActiveOffers } = require("../services/offer.service");
const {
  createApplication,
  getMyRequests,
} = require("../services/application.service");
const {
  createPracticeRequest,
} = require("../services/practice.service");

async function getOffers(req, res) {
  const offers = await listActiveOffers();
  res.json(
    offers.map(o => ({
      id: o.id,
      title: o.title,
      company: o.company,
      details: o.description,
    }))
  );
}

async function getMyRequestsController(req, res) {
  const student = await getStudentByUserId(req.user.id);
  if (!student) return res.status(404).json({ message: "Estudiante no encontrado" });

  const data = await getMyRequests(student.id);
  res.json(data);
}

async function createApplicationController(req, res) {
  const student = await getStudentByUserId(req.user.id);
  // ✅ Regla: si ya tiene práctica activa, no puede postular a oferta interna
  if (await hasActivePractice(student.id)) {
    return res.status(400).json({
      message: "Ya tienes una práctica activa. No puedes postular a otra oferta.",
    });
  }
  const offerId = Number(req.params.offerId);

  const app = await createApplication(student.id, offerId);
  res.status(201).json(app);
}

async function createPracticeRequestController(req, res) {
  const student = await getStudentByUserId(req.user.id);
  if (await hasActivePractice(student.id)) {
    return res.status(400).json({
      message: "Ya tienes una práctica activa. No puedes registrar otra solicitud.",
    });
  }

  // ✅ Regla 2: si ya tiene una solicitud externa pendiente, no puede crear otra
  if (await hasPendingExternalRequest(student.id)) {
    return res.status(400).json({
      message: "Ya tienes una solicitud externa pendiente. Espera a que sea revisada.",
    });
  }
  const created = await createPracticeRequest(student.id, req.body);
  res.status(201).json(created);
}

module.exports = {
  getOffers,
  getMyRequestsController,
  createApplicationController,
  createPracticeRequestController,
};
