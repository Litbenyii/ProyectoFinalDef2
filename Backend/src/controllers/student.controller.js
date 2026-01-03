const { getStudentByUserId } = require("../services/student.service");
const { createApplication, getMyRequests } = require("../services/application.service");
const { createPracticeRequest } = require("../services/practice.service");
const { listActiveOffers } = require("../services/offer.service");

  //Listar ofertas activas (FORMATO ESPERADO POR StudentHome)
  async function getOffers(req, res) {
    try {
      const offers = await listActiveOffers();

      // 🔁 Adaptamos al formato Prisma-style
      const mapped = offers.map(o => ({
        id: o.id,
        title: o.title,
        company: o.company,
        location: o.location,
        hours: o.hours,
        modality: o.modality,
        details: o.details || o.description || "",
        startDate: o.start_date || o.startDate || null,
        deadline: o.deadline || null,
      }));

      return res.json(mapped);
    } catch (error) {
      console.error("Error en getOffers:", error);
      return res.status(500).json({ message: "Error al obtener ofertas" });
    }
  }

  //Postulaciones y solicitudes externas del estudiante
  async function getMyRequestsController(req, res) {
    try {
      const student = await getStudentByUserId(req.user.id);

      if (!student) {
        return res.status(404).json({ message: "Estudiante no encontrado" });
      }

      const raw = await getMyRequests(student.id);

      // 🔁 NORMALIZAMOS salida (como Prisma)
      const mapped = raw.map(r => ({
        id: r.id,
        type: r.type || (r.offer_id ? "INTERNAL" : "EXTERNAL"),
        offerTitle: r.offerTitle || r.offer_title || r.title || null,
        company: r.company || null,
        startDate: r.start_date || r.startDate || null,
        endDate: r.end_date || r.endDate || null,
        status: r.status || "PEND_EVAL",
      }));

      return res.json(mapped);
    } catch (error) {
      console.error("Error en getMyRequests:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener tus solicitudes" });
    }
  }

  //Crear solicitud de práctica externa
  async function createPracticeRequestController(req, res) {
    try {
      const student = await getStudentByUserId(req.user.id);

      if (!student) {
        return res.status(404).json({ message: "Estudiante no encontrado" });
      }

      const created = await createPracticeRequest(student.id, req.body);

      return res.status(201).json({
        id: created.id,
        type: "EXTERNAL",
        company: created.company,
        tutorName: created.tutor_name || created.tutorName || null,
        tutorEmail: created.tutor_email || created.tutorEmail || null,
        startDate: created.start_date || created.startDate || null,
        details: created.details || null,
        location: created.location || null,
        modality: created.modality || null,
        endDate: created.end_date || created.endDate || null,
        status: created.status || "Pendiente",
      });
    } catch (error) {
      console.error("Error en createPracticeRequest:", error);
      return res
        .status(500)
        .json({ message: "Error al crear solicitud de práctica externa" });
    }
  }

  //Postular a una oferta interna
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

      return res.status(201).json({
        id: app.id,
        type: "INTERNAL",
        offerTitle: app.offerTitle || app.offer_title || null,
        status: app.status || "Pendiente",
      });
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
