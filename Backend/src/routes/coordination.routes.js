const express = require("express");
const router = express.Router();
const {
  listExternalRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
  listOffersController,
  createOfferController,
  deactivateOfferController,
  getCoordinatorApplications,
  approveApplication,
  rejectApplication,
  createStudentController,
  getEvaluators,
  getOpenPractices,
  assignEvaluatorToPractice,
  finalizePractice,
  createEvaluatorController,
} = require("../controllers/coordination.controller");
const { authMiddleware, requireCoordination } = require("../middleware/auth");

router.use(authMiddleware, requireCoordination);

// solicitudes externas
router.get("/external-requests", listExternalRequests);
router.post("/external-requests/:id/approve", approvePracticeRequest);
router.post("/external-requests/:id/reject", rejectPracticeRequest);

// ofertas de practica
router.get("/offers", listOffersController);
router.post("/offers", createOfferController);
router.post("/offers/:id/deactivate", deactivateOfferController);

// postulaciones
router.get("/applications", getCoordinatorApplications);
router.post("/applications/:id/approve", approveApplication);
router.post("/applications/:id/reject", rejectApplication);

// crear estudiante
router.post("/students", createStudentController);

// evaluadores y prácticas
router.get("/evaluators", getEvaluators);
router.get("/practices/open", getOpenPractices);
router.post("/practices/:id/assign", assignEvaluatorToPractice);
router.post("/practices/:id/close", finalizePractice);
router.post("/evaluators", createEvaluatorController);

module.exports = router;