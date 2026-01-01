const {
  getCoordinatorPracticeRequests,
  updatePracticeRequestStatus,
  getOpenPractices,
  getEvaluators,
  assignEvaluatorToPractice,
  closePractice,
} = require("../services/practice.service");

const {
  listAllOffers,
  createOffer,
  deactivateOffer,
} = require("../services/offer.service");

const {
  getCoordinatorApplications,
  updateApplicationStatus,
} = require("../services/application.service");

const {
  createStudent,
} = require("../services/student.service");

//lista de solicitudes externas
async function listExternalRequests(req, res) {
  try {
    const requests = await getCoordinatorPracticeRequests();
    return res.json(requests);
  } catch (error) {
    console.error("Error en listExternalRequests:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener solicitudes externas" });
  }
}

//Aprobar solicitud externa
async function approvePracticeRequestController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const updated = await updatePracticeRequestStatus(id, "APPROVED");
    return res.json(updated);
  } catch (error) {
    console.error("Error en approvePracticeRequest:", error);
    return res
      .status(500)
      .json({ message: "Error al aprobar solicitud de práctica" });
  }
}

//Rechazar solicitud externa
async function rejectPracticeRequestController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const updated = await updatePracticeRequestStatus(id, "REJECTED");
    return res.json(updated);
  } catch (error) {
    console.error("Error en rejectPracticeRequest:", error);
    return res
      .status(500)
      .json({ message: "Error al rechazar solicitud de práctica" });
  }
}

//ofertas de practica
async function listOffersController(req, res) {
  try {
    const offers = await listAllOffers();
    return res.json(offers);
  } catch (error) {
    console.error("Error en listOffersController:", error);
    return res.status(500).json({ message: "Error al obtener ofertas" });
  }
}

async function createOfferController(req, res) {
  try {
    const offer = await createOffer(req.body);
    return res.status(201).json(offer);
  } catch (error) {
    console.error("Error en createOfferController:", error);
    return res.status(500).json({ message: "Error al crear oferta" });
  }
}

async function deactivateOfferController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const offer = await deactivateOffer(id);
    return res.json(offer);
  } catch (error) {
    console.error("Error en deactivateOfferController:", error);
    return res.status(500).json({ message: "Error al desactivar oferta" });
  }
}

//postulaciones
async function listApplicationsController(req, res) {
  try {
    const apps = await getCoordinatorApplications();
    return res.json(apps);
  } catch (error) {
    console.error("Error en listApplicationsController:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener postulaciones" });
  }
}

async function approveApplicationController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const app = await updateApplicationStatus(id, "APPROVED");
    return res.json(app);
  } catch (error) {
    console.error("Error en approveApplicationController:", error);
    return res
      .status(500)
      .json({ message: "Error al aprobar postulación" });
  }
}

async function rejectApplicationController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const app = await updateApplicationStatus(id, "REJECTED");
    return res.json(app);
  } catch (error) {
    console.error("Error en rejectApplicationController:", error);
    return res
      .status(500)
      .json({ message: "Error al rechazar postulación" });
  }
}

//registrar estudiante
async function createStudentController(req, res) {
  try {
    const { fullName, rut, email, career } = req.body;

    if (!fullName || !rut || !email || !career) {
      return res.status(400).json({ message: "Faltan datos del estudiante" });
    }

    const result = await createStudent({ fullName, rut, email, career });
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error en createStudentController:", error);
    return res
      .status(500)
      .json({ message: "Error al registrar estudiante" });
  }
}

//evaluadores de practica
async function listEvaluatorsController(req, res) {
  try {
    const evaluators = await getEvaluators();
    return res.json(evaluators);
  } catch (error) {
    console.error("Error en listEvaluatorsController:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener evaluadores" });
  }
}

async function listOpenPracticesController(req, res) {
  try {
    const practices = await getOpenPractices();
    return res.json(practices);
  } catch (error) {
    console.error("Error en listOpenPracticesController:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener prácticas abiertas" });
  }
}

async function assignEvaluatorController(req, res) {
  try {
    const id = Number(req.params.id);
    const { evaluatorId } = req.body;

    if (Number.isNaN(id) || !evaluatorId) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const practice = await assignEvaluatorToPractice(id, Number(evaluatorId));
    return res.json(practice);
  } catch (error) {
    console.error("Error en assignEvaluatorController:", error);
    return res
      .status(500)
      .json({ message: "Error al asignar evaluador" });
  }
}

async function closePracticeController(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const practice = await closePractice(id);
    return res.json(practice);
  } catch (error) {
    console.error("Error en closePracticeController:", error);
    return res
      .status(500)
      .json({ message: "Error al cerrar práctica" });
  }
}

module.exports = {
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
};
