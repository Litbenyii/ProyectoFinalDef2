const offerService = require("../services/offer.service");
const studentService = require("../services/student.service");
const applicationService = require("../services/application.service");
const practiceService = require("../services/practice.service");

// OFERTAS
async function createOfferController(req, res) {
  const offer = await offerService.createOffer(req.body, req.user.id);
  res.status(201).json(offer);
}

async function listOffersController(req, res) {
  const offers = await offerService.listAllOffers();
  res.json(offers);
}

async function deactivateOfferController(req, res) {
  await offerService.deactivateOffer(req.params.id);
  res.json({ message: "Oferta eliminada" });
}

// ESTUDIANTES
async function createStudentController(req, res) {
  const result = await studentService.createStudent(req.body);
  res.status(201).json(result);
}

// SOLICITUDES EXTERNAS
async function listExternalRequests(req, res) {
  const list = await practiceService.getCoordinatorPracticeRequests();
  res.json(list);
}

async function approvePracticeRequest(req, res) {
  const updated = await practiceService.updatePracticeRequestStatus(
    req.params.id,
    "Aprobada"
  );
  res.json(updated);
}

async function rejectPracticeRequest(req, res) {
  const updated = await practiceService.updatePracticeRequestStatus(
    req.params.id,
    "Rechazada"
  );
  res.json(updated);
}

// POSTULACIONES INTERNAS
async function getCoordinatorApplications(req, res) {
  const apps = await applicationService.getCoordinatorApplications();
  res.json(apps);
}

async function approveApplication(req, res) {
  const updated = await applicationService.updateApplicationStatus(
    req.params.id,
    "Aprobada"
  );
  res.json(updated);
}

async function rejectApplication(req, res) {
  const updated = await applicationService.updateApplicationStatus(
    req.params.id,
    "Rechazada"
  );
  res.json(updated);
}

// PRÁCTICAS Y EVALUADORES
async function getEvaluators(req, res) {
  const evals = await practiceService.getEvaluators();
  res.json(evals);
}

async function getOpenPractices(req, res) {
  const practices = await practiceService.getOpenPractices();
  res.json(practices);
}

async function assignEvaluatorToPractice(req, res) {
  const updated = await practiceService.assignEvaluatorToPractice(
    req.params.id,
    req.body.evaluatorId
  );
  res.json(updated);
}

async function finalizePractice(req, res) {
  const updated = await practiceService.closePractice(req.params.id);
  res.json(updated);
}

async function createEvaluatorController(req, res) {
  const ev = await practiceService.createEvaluator(req.body);
  res.status(201).json(ev);
}

module.exports = {
  createOfferController,
  listOffersController,
  deactivateOfferController,
  createStudentController,
  listExternalRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
  getCoordinatorApplications,
  approveApplication,
  rejectApplication,
  getEvaluators,
  getOpenPractices,
  assignEvaluatorToPractice,
  finalizePractice,
  createEvaluatorController,
};
