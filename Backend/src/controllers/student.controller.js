const { getStudentByUserId } = require("../services/student.service");
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
  const offerId = Number(req.params.offerId);

  const app = await createApplication(student.id, offerId);
  res.status(201).json(app);
}

async function createPracticeRequestController(req, res) {
  const student = await getStudentByUserId(req.user.id);
  const created = await createPracticeRequest(student.id, req.body);
  res.status(201).json(created);
}

module.exports = {
  getOffers,
  getMyRequestsController,
  createApplicationController,
  createPracticeRequestController,
};
