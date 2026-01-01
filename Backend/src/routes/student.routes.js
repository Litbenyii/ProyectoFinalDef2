const express = require("express");
const {
  getOffers,
  getMyRequestsController,
  createPracticeRequestController,
  createApplicationController,
} = require("../controllers/student.controller");
const {
  authMiddleware,
  requireStudent,
} = require("../middleware/auth");

const router = express.Router();


router.use(authMiddleware, requireStudent);

router.get("/offers", getOffers);
router.get("/my/requests", getMyRequestsController);
router.post("/practice-requests", createPracticeRequestController);
router.post("/applications/:offerId", createApplicationController);

module.exports = router;
