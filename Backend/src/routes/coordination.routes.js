const express = require("express");
const {
  listExternalRequests,
  approvePracticeRequestController,
  rejectPracticeRequestController,
  listOffersController,
  createOfferController,
  deactivateOfferController,
  listApplicationsController,
  approveApplicationController,
  rejectApplicationController,
  createStudentController,
  listEvaluatorsController,
  listOpenPracticesController,
  assignEvaluatorController,
  closePracticeController,
} = require("../controllers/coordination.controller");
const {
  authMiddleware,
  requireCoordination,
} = require("../middleware/auth");

const router = express.Router();


router.use(authMiddleware, requireCoordination);

// Solicitudes externas
router.get("/external-requests", listExternalRequests);
router.post("/external-requests/:id/approve", approvePracticeRequestController);
router.post("/external-requests/:id/reject", rejectPracticeRequestController);

// Ofertas
router.get("/offers", listOffersController);
router.post("/offers", createOfferController);
router.post("/offers/:id/deactivate", deactivateOfferController);

// Postulaciones
router.get("/applications", listApplicationsController);
router.post("/applications/:id/approve", approveApplicationController);
router.post("/applications/:id/reject", rejectApplicationController);

// Estudiantes
router.post("/students", createStudentController);

// Evaluadores / prácticas
router.get("/evaluators", listEvaluatorsController);
router.get("/practices/open", listOpenPracticesController);
router.post("/practices/:id/assign", assignEvaluatorController);
router.post("/practices/:id/close", closePracticeController);

module.exports = router;
