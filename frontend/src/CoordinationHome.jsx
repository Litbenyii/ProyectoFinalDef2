import React, { useEffect, useState } from "react";
import {
  getCoordinatorPracticeRequests,
  approvePracticeRequest,
  rejectPracticeRequest,
  getCoordOffers,
  createOffer,
  deactivateOffer,
  getCoordinatorApplications,
  approveApplication,
  rejectApplication,
  createStudent,
  getEvaluators,
  getOpenPractices,
  assignEvaluatorToPractice,
} from "./api";

export default function CoordinationHome({ name, onLogout, token }) {
  const [activeTab, setActiveTab] = useState("external"); // external | offers | applications | students

  const [externalRequests, setExternalRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [openPractices, setOpenPractices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Formularios
  const [offerForm, setOfferForm] = useState({
    title: "",
    company: "",
    location: "",
    hours: "",
    modality: "",
    details: "",
    startDate: "",
    deadline: "",
  });

  const [studentForm, setStudentForm] = useState({
    rut: "",
    name: "",
    email: "",
    career: "",
  });

  const [assignForm, setAssignForm] = useState({
    practiceId: "",
    evaluatorId: "",
  });

  const loadExternalRequests = async () => {
    try {
      const data = await getCoordinatorPracticeRequests(token);
      setExternalRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar solicitudes externas");
    }
  };

  const loadOffers = async () => {
    try {
      const data = await getCoordOffers(token);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar ofertas");
    }
  };

  const loadApplications = async () => {
    try {
      const data = await getCoordinatorApplications(token);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar postulaciones");
    }
  };

  const loadEvaluatorsAndPractices = async () => {
    try {
      const [evals, practices] = await Promise.all([
        getEvaluators(token),
        getOpenPractices(token),
      ]);

      setEvaluators(Array.isArray(evals) ? evals : []);
      setOpenPractices(Array.isArray(practices) ? practices : []);
    } catch (err) {
      setError(err.message || "Error al cargar evaluadores/prácticas");
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    setMsg("");
    await Promise.all([
      loadExternalRequests(),
      loadOffers(),
      loadApplications(),
      loadEvaluatorsAndPractices(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignChange = (e) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!offerForm.title || !offerForm.company) {
      setError("Debe indicar al menos título y empresa.");
      return;
    }

    try {
      await createOffer(token, {
        ...offerForm,
        hours: offerForm.hours ? Number(offerForm.hours) : null,
      });
      setMsg("Oferta creada correctamente.");
      setOfferForm({
        title: "",
        company: "",
        location: "",
        hours: "",
        modality: "",
        details: "",
        startDate: "",
        deadline: "",
      });
      await loadOffers();
    } catch (err) {
      setError(err.message || "Error al crear oferta");
    }
  };

  const handleDeactivateOffer = async (id) => {
    setError("");
    setMsg("");
    try {
      await deactivateOffer(token, id);
      setMsg("Oferta desactivada.");
      await loadOffers();
    } catch (err) {
      setError(err.message || "Error al desactivar oferta");
    }
  };

  const handleExternalDecision = async (id, action) => {
    setError("");
    setMsg("");
    try {
      if (action === "approve") {
        await approvePracticeRequest(token, id);
        setMsg("Práctica externa aprobada.");
      } else {
        await rejectPracticeRequest(token, id);
        setMsg("Práctica externa rechazada.");
      }
      await loadExternalRequests();
    } catch (err) {
      setError(err.message || "Error al actualizar solicitud externa");
    }
  };

  const handleApplicationDecision = async (id, action) => {
    setError("");
    setMsg("");
    try {
      if (action === "approve") {
        await approveApplication(token, id);
        setMsg("Postulación aprobada.");
      } else {
        await rejectApplication(token, id);
        setMsg("Postulación rechazada.");
      }
      await loadApplications();
    } catch (err) {
      setError(err.message || "Error al actualizar postulación");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!studentForm.rut || !studentForm.name || !studentForm.email) {
      setError("RUT, nombre y correo son obligatorios.");
      return;
    }

    try {
      await createStudent(token, {
        rut: studentForm.rut,
        name: studentForm.name,
        email: studentForm.email,
        career: studentForm.career || null,
      });
      setMsg("Estudiante registrado correctamente.");
      setStudentForm({
        rut: "",
        name: "",
        email: "",
        career: "",
      });
    } catch (err) {
      setError(err.message || "Error al registrar estudiante");
    }
  };

  const handleAssignEvaluator = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!assignForm.practiceId || !assignForm.evaluatorId) {
      setError("Debe seleccionar práctica y evaluador.");
      return;
    }

    try {
      await assignEvaluatorToPractice(
        token,
        assignForm.practiceId,
        assignForm.evaluatorId
      );
      setMsg("Evaluador asignado correctamente.");
      setAssignForm({ practiceId: "", evaluatorId: "" });
      await loadEvaluatorsAndPractices();
    } catch (err) {
      setError(err.message || "Error al asignar evaluador");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Coordinación de Prácticas</h1>
          <p className="text-xs text-slate-200">
            Usuario: Coordinador Prácticas ({name})
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-slate-900 hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </header>

      {/* TABS */}
      <nav className="max-w-6xl mx-auto px-4 pt-6">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <TabButton
            label="Solicitudes externas"
            active={activeTab === "external"}
            onClick={() => setActiveTab("external")}
          />
          <TabButton
            label="Ofertas"
            active={activeTab === "offers"}
            onClick={() => setActiveTab("offers")}
          />
          <TabButton
            label="Postulaciones"
            active={activeTab === "applications"}
            onClick={() => setActiveTab("applications")}
          />
          <TabButton
            label="Estudiantes / Evaluadores"
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pb-10 pt-4 space-y-6">
        {(msg || error) && (
          <div className="space-y-2">
            {msg && (
              <div className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
                {msg}
              </div>
            )}
            {error && (
              <div className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-500">Cargando información...</p>
        )}

        {!loading && activeTab === "external" && (
          <SectionExternalRequests
            items={externalRequests}
            onDecision={handleExternalDecision}
          />
        )}

        {!loading && activeTab === "offers" && (
          <SectionOffers
            offers={offers}
            form={offerForm}
            onFormChange={handleOfferChange}
            onCreate={handleCreateOffer}
            onDeactivate={handleDeactivateOffer}
          />
        )}

        {!loading && activeTab === "applications" && (
          <SectionApplications
            applications={applications}
            onDecision={handleApplicationDecision}
          />
        )}

        {!loading && activeTab === "students" && (
          <SectionStudentsEvaluators
            studentForm={studentForm}
            onStudentChange={handleStudentChange}
            onCreateStudent={handleCreateStudent}
            assignForm={assignForm}
            onAssignChange={handleAssignChange}
            onAssign={handleAssignEvaluator}
            openPractices={openPractices}
            evaluators={evaluators}
          />
        )}
      </main>
    </div>
  );
}

// Componentes auxiliares

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full font-medium ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function SectionExternalRequests({ items, onDecision }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h2 className="text-base font-semibold text-slate-900 mb-1">
        Solicitudes de práctica externa
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Prácticas propuestas por estudiantes para empresas externas.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay solicitudes de práctica externa pendientes.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((req) => (
            <div
              key={req.id}
              className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {req.company || "Empresa sin nombre"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estudiante: {req.studentName || "N/D"}
                    {req.studentEmail && ` · ${req.studentEmail}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    Tutor: {req.tutorName || "N/D"}
                    {req.tutorEmail && ` · ${req.tutorEmail}`}
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    req.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : req.status === "REJECTED"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {req.status || "PEND_EVAL"}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {req.details || "Sin detalles adicionales."}
              </p>

              <p className="text-[11px] text-slate-500">
                Desde{" "}
                {req.startDate
                  ? new Date(req.startDate).toLocaleDateString("es-CL")
                  : "-"}{" "}
                hasta{" "}
                {req.endDate
                  ? new Date(req.endDate).toLocaleDateString("es-CL")
                  : "-"}
              </p>

              {req.status === "PEND_EVAL" && (
                <div className="pt-1 flex gap-2 justify-end">
                  <button
                    onClick={() => onDecision(req.id, "approve")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => onDecision(req.id, "reject")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SectionOffers({
  offers,
  form,
  onFormChange,
  onCreate,
  onDeactivate,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      {/* Ofertas publicadas */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Ofertas publicadas
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Ofertas de práctica disponibles para los estudiantes.
        </p>

        {offers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay ofertas creadas aún.
          </p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {offer.company} · {offer.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-white">
                      ID {offer.id}
                    </span>
                    {!offer.active && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {offer.details || "Sin descripción"}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Horas: {offer.hours ?? "N/D"}</span>
                  <span>Modalidad: {offer.modality || "N/D"}</span>
                  <span>
                    Inicio:{" "}
                    {offer.startDate
                      ? new Date(offer.startDate).toLocaleDateString("es-CL")
                      : "-"}
                  </span>
                  <span>
                    Cierre:{" "}
                    {offer.deadline
                      ? new Date(offer.deadline).toLocaleDateString("es-CL")
                      : "-"}
                  </span>
                </div>

                {offer.active && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onDeactivate(offer.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Desactivar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crear nueva oferta */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Crear nueva oferta
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Complete los datos para publicar una nueva práctica.
        </p>

        <form onSubmit={onCreate} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs mb-1 text-slate-700">Título</label>
            <input
              type="text"
              name="title"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={form.title}
              onChange={onFormChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">Empresa</label>
            <input
              type="text"
              name="company"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={form.company}
              onChange={onFormChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-700">Lugar</label>
              <input
                type="text"
                name="location"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                value={form.location}
                onChange={onFormChange}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-700">
                Horas totales
              </label>
              <input
                type="number"
                min="0"
                name="hours"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                value={form.hours}
                onChange={onFormChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">
              Modalidad
            </label>
            <select
              name="modality"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none bg-white"
              value={form.modality}
              onChange={onFormChange}
            >
              <option value="">Seleccione...</option>
              <option value="Presencial">Presencial</option>
              <option value="Remota">Remota</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">
              Detalles
            </label>
            <textarea
              name="details"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none resize-none"
              value={form.details}
              onChange={onFormChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1 text-slate-700">
                Fecha inicio práctica
              </label>
              <input
                type="date"
                name="startDate"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                value={form.startDate}
                onChange={onFormChange}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-slate-700">
                Fecha límite postulación
              </label>
              <input
                type="date"
                name="deadline"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                value={form.deadline}
                onChange={onFormChange}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Guardar oferta
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function SectionApplications({ applications, onDecision }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h2 className="text-base font-semibold text-slate-900 mb-1">
        Postulaciones de estudiantes a ofertas
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Revisar y aprobar/rechazar postulaciones internas.
      </p>

      {applications.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay postulaciones registradas.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Estudiante</th>
                <th className="text-left py-2 px-3 font-medium">Oferta</th>
                <th className="text-left py-2 px-3 font-medium">Empresa</th>
                <th className="text-left py-2 px-3 font-medium">Estado</th>
                <th className="text-right py-2 px-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="py-2 px-3">
                    <div className="text-xs font-medium text-slate-900">
                      {app.studentName || "N/D"}
                    </div>
                    {app.studentEmail && (
                      <div className="text-[11px] text-slate-500">
                        {app.studentEmail}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="text-xs font-medium text-slate-900">
                      {app.offerTitle || "N/D"}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-slate-600">
                    {app.company || "N/D"}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                        app.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : app.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {app.status || "PEND_EVAL"}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {app.status === "PEND_EVAL" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onDecision(app.id, "approve")}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => onDecision(app.id, "reject")}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SectionStudentsEvaluators({
  studentForm,
  onStudentChange,
  onCreateStudent,
  assignForm,
  onAssignChange,
  onAssign,
  openPractices,
  evaluators,
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      {/* Registrar estudiante */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Registrar nuevo estudiante
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Crear usuario estudiante para el portal de prácticas.
        </p>

        <form onSubmit={onCreateStudent} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs mb-1 text-slate-700">RUT</label>
            <input
              type="text"
              name="rut"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={studentForm.rut}
              onChange={onStudentChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">Nombre</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={studentForm.name}
              onChange={onStudentChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">Correo</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={studentForm.email}
              onChange={onStudentChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">Carrera</label>
            <input
              type="text"
              name="career"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
              value={studentForm.career}
              onChange={onStudentChange}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Guardar estudiante
            </button>
          </div>
        </form>
      </div>

      {/* Asignar evaluador */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Asignar evaluador a práctica
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Seleccione una práctica abierta y un evaluador disponible.
        </p>

        <form onSubmit={onAssign} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs mb-1 text-slate-700">
              Práctica abierta
            </label>
            <select
              name="practiceId"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none bg-white"
              value={assignForm.practiceId}
              onChange={onAssignChange}
            >
              <option value="">Seleccione una práctica...</option>
              {openPractices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.studentName || "Estudiante sin nombre"} ·{" "}
                  {p.company || "Empresa"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-700">
              Evaluador
            </label>
            <select
              name="evaluatorId"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none bg-white"
              value={assignForm.evaluatorId}
              onChange={onAssignChange}
            >
              <option value="">Seleccione un evaluador...</option>
              {evaluators.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Asignar evaluador
            </button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-800 mb-2">
            Prácticas abiertas
          </h3>
          {openPractices.length === 0 ? (
            <p className="text-xs text-slate-500">
              No hay prácticas abiertas.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-600">
              {openPractices.map((p) => (
                <li
                  key={p.id}
                  className="border border-slate-100 rounded-lg px-3 py-2 bg-slate-50/50"
                >
                  <div className="font-medium text-slate-900">
                    {p.studentName || "Estudiante"} · {p.company || "Empresa"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Estado: {p.status || "OPEN"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
