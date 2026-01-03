const offerService = require("../services/offer.service");
const studentService = require("../services/student.service");
const applicationService = require("../services/application.service");
const practiceService = require("../services/practice.service");
const { sendAssignmentEmail } = require("../services/email.service");
const coordinationService = require("../services/practice.service");

//OFERTAS
async function createOfferController(req, res) {
  try {
    // el front envía 'details', el service mapea a 'description'
    const offer = await offerService.createOffer(req.body, req.user.id);
    res.status(201).json(offer);
  } catch (e) {
    console.error("Error en createOfferController:", e);
    res.status(500).json({ message: e.message || "Error al crear la oferta" });
  }
}

async function listOffersController(req, res) {
  try {
    const offers = await offerService.listAllOffers();

    // Podemos mapear 'description' a 'details' para mantener formato del front
    const mapped = offers.map((o) => ({
      id: o.id,
      title: o.title,
      company: o.company,
      location: o.location,
      hours: o.hours,
      modality: o.modality,
      details: o.details || o.description || "",
      startDate: o.start_date || o.startDate || null,
      deadline: o.deadline || null,
      createdAt: o.created_at || o.createdAt || null,
    }));

    res.json(mapped);
  } catch (e) {
    console.error("Error en listOffersController:", e);
    res.status(500).json({ message: "Error al listar ofertas" });
  }
}

async function deactivateOfferController(req, res) {
  try {
    const { id } = req.params;
    await offerService.deactivateOffer(id);
    res.json({ message: "Oferta desactivada/eliminada correctamente" });
  } catch (e) {
    console.error("Error en deactivateOfferController:", e);
    res.status(500).json({ message: "Error al desactivar oferta" });
  }
}

//ESTUDIANTES
async function createStudentController(req, res) {
  try {
    // Llamamos al service
    const result = await studentService.createStudent(req.body);
    
    // Devolvemos el resultado al frontend
    res.status(201).json(result);
  } catch (e) {
    console.error("Error en createStudentController:", e);
    res.status(500).json({ message: e.message || "Error al crear estudiante" });
  }
}

//SOLICITUDES EXTERNAS 
async function listExternalRequests(req, res) {
  try {
    const list = await practiceService.getCoordinatorPracticeRequests();
    res.json(list);
  } catch (e) {
    console.error("Error en listExternalRequests:", e);
    res
      .status(500)
      .json({ message: "Error al obtener solicitudes externas" });
  }
}


async function approvePracticeRequest(req, res) {
  try {
    const { id } = req.params;
    const updated = await practiceService.updatePracticeRequestStatus(
      id,
      "Aprobada"
    );
    res.json({ message: "Solicitud aprobada", request: updated });
  } catch (e) {
    console.error("Error en approvePracticeRequest:", e);
    res.status(500).json({ message: "Error al aprobar solicitud" });
  }
}

async function rejectPracticeRequest(req, res) {
  try {
    const { id } = req.params;
    const updated = await practiceService.updatePracticeRequestStatus(
      id,
      "Rechazada"
    );
    res.json({ message: "Solicitud rechazada", request: updated });
  } catch (e) {
    console.error("Error en rejectPracticeRequest:", e);
    res.status(500).json({ message: "Error al rechazar solicitud" });
  }
}

//POSTULACIONES INTERNAS
async function getCoordinatorApplications(req, res) {
  try {
    const apps = await applicationService.getCoordinatorApplications();
    res.json(apps);
  } catch (e) {
    console.error("Error en getCoordinatorApplications:", e);
    res
      .status(500)
      .json({ message: "Error al obtener postulaciones internas" });
  }
}

async function approveApplication(req, res) {
  try {
    const { id } = req.params;
    const updated = await applicationService.updateApplicationStatus(
      id,
      "Aprobada"
    );
    res.json({ message: "Postulación aprobada", application: updated });
  } catch (e) {
    console.error("Error en approveApplication:", e);
    res.status(500).json({ message: "Error al aprobar postulación" });
  }
}

async function rejectApplication(req, res) {
  try {
    const { id } = req.params;
    const updated = await applicationService.updateApplicationStatus(
      id,
      "Rechazada"
    );
    res.json({ message: "Postulación rechazada", application: updated });
  } catch (e) {
    console.error("Error en rejectApplication:", e);
    res.status(500).json({ message: "Error al rechazar postulación" });
  }
}

//EVALUADORES Y PRÁCTICAS
async function getEvaluators(req, res) {
  try {
    const evaluators = await coordinationService.getEvaluators(); // O el nombre que uses
    res.json(evaluators);
  } catch (error) {
    console.error("❌ ERROR EN GET EVALUATORS:", error); // 👈 AGREGA ESTO
    res.status(500).json({ message: error.message });
  }
}

async function getOpenPractices(req, res) {
  try {
    const practices = await practiceService.getOpenPractices();
    res.json(practices);
  } catch (e) {
    console.error("Error en getOpenPractices:", e);
    res.status(500).json({ message: "Error al obtener prácticas abiertas" });
  }
}

async function assignEvaluatorToPractice(req, res) {
  try {
    const { id } = req.params;
    const { evaluatorId } = req.body;

    //Asignamos en la BD (esto ya lo tenías)
    const updated = await practiceService.assignEvaluatorToPractice(id, evaluatorId);

    //Buscamos datos del evaluador y el alumno para el correo
    const info = await pool.query(`
      SELECT 
        e.name as eval_name, e.email as eval_email,
        s.full_name as student_name,
        p.company_name
      FROM external_practice_requests p
      JOIN evaluators e ON e.id = $1
      JOIN students s ON s.id = p.student_id
      WHERE p.id = $2
    `, [evaluatorId, id]);

    if (info.rows.length > 0) {
      const data = info.rows[0];
      //Enviamos el correo (sin esperar a que termine para no bloquear la respuesta)
      sendAssignmentEmail(data.eval_email, data.eval_name, data.student_name, data.company_name);
    }

    res.json({ message: "Evaluador asignado y notificado", practice: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al asignar evaluador" });
  }
}

async function finalizePractice(req, res) {
  try {
    const { id } = req.params;
    const updated = await practiceService.closePractice(id);
    res.json({ message: "Práctica finalizada", practice: updated });
  } catch (e) {
    console.error("Error en finalizePractice:", e);
    res.status(500).json({ message: "Error al finalizar práctica" });
  }
}

async function createEvaluatorController(req, res) {
  try {
    console.log("📥 Datos recibidos para crear:", req.body); 
    const result = await coordinationService.createEvaluator(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ ERROR EN CREATE EVALUATOR:", error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createOfferController, listOffersController, deactivateOfferController,
  createStudentController, listExternalRequests, approvePracticeRequest,
  rejectPracticeRequest, getCoordinatorApplications, approveApplication,
  rejectApplication, getEvaluators, getOpenPractices, 
  assignEvaluatorToPractice, finalizePractice, createEvaluatorController,
};