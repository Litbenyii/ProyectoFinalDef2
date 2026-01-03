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
  try {
    const student = await getStudentByUserId(req.user.id);

    const {
      company,
      tutorName,
      tutorEmail,
      startDate,
      endDate,
      details,
      location,
      modality,
    } = req.body;

    // VALIDACIÓN 1: campos obligatorios
    if (!company || !tutorName || !tutorEmail) {
      return res.status(400).json({
        message: "Empresa, tutor y correo del tutor son obligatorios.",
      });
    }

    // VALIDACIÓN 2: formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tutorEmail)) {
      return res.status(400).json({
        message: "El correo del tutor no tiene un formato válido.",
      });
    }

    // VALIDACIÓN 3: fechas coherentes
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "La fecha de inicio no puede ser posterior a la de término.",
      });
    }

    // VALIDACIÓN 4: no más de una práctica activa
    if (await hasActivePractice(student.id)) {
      return res.status(400).json({
        message: "Ya tienes una práctica activa.",
      });
    }

    // VALIDACIÓN 5: no más de una solicitud externa pendiente
    if (await hasPendingExternalRequest(student.id)) {
      return res.status(400).json({
        message: "Ya tienes una solicitud externa pendiente.",
      });
    }

    const created = await createPracticeRequest(student.id, {
      company,
      tutorName,
      tutorEmail,
      startDate: startDate || null,
      endDate: endDate || null,
      details: details || "",
      location: location || null,
      modality: modality || null,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error al crear solicitud de práctica externa",
    });
  }
}

module.exports = {
  getOffers,
  getMyRequestsController,
  createApplicationController,
  createPracticeRequestController,
};
