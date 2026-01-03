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
  createEvaluator,
} from "./api";

export default function CoordinationHome({ name, onLogout, token }) {
  const [activeTab, setActiveTab] = useState("external");

  // ESTADOS DE DATOS
  const [externalRequests, setExternalRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [openPractices, setOpenPractices] = useState([]);

  // ESTADOS DE UI
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // FORMULARIOS
  const [offerForm, setOfferForm] = useState({
    title: "", company: "", location: "", hours: "", modality: "", details: "", startDate: "", deadline: "",
  });

  const [studentForm, setStudentForm] = useState({
    rut: "", name: "", email: "", career: "",
  });

  const [evaluatorForm, setEvaluatorForm] = useState({
    name: "", email: "", specialty: "",
  });

  const [assignForm, setAssignForm] = useState({
    practiceId: "", evaluatorId: "",
  });

  // CARGA DE DATOS CENTRALIZADA
  const loadAll = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      
      // Ejecutamos todas las consultas al API en paralelo
      const [external, offersData, apps, evals, practices] = await Promise.all([
        getCoordinatorPracticeRequests(token),
        getCoordOffers(token),
        getCoordinatorApplications(token),
        getEvaluators(token),
        getOpenPractices(token),
      ]);

      setExternalRequests(external || []);
      setOffers(offersData || []);
      setApplications(apps || []);
      setEvaluators(evals || []);
      setOpenPractices(practices || []);
      
      console.log("Prácticas para asignar:", practices); // Para debug en consola
    } catch (err) {
      setError(err.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  // Solo un useEffect para cargar todo al inicio
  useEffect(() => {
    loadAll();
  }, [token]);

  // HANDLERS DE FORMULARIOS
  const handleOfferChange = (e) => setOfferForm({ ...offerForm, [e.target.name]: e.target.value });
  const handleStudentChange = (e) => setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  const handleEvaluatorChange = (e) => setEvaluatorForm({ ...evaluatorForm, [e.target.name]: e.target.value });
  const handleAssignChange = (e) => setAssignForm({ ...assignForm, [e.target.name]: e.target.value });

  // ACCIONES
  const showTemporaryMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await createOffer(token, { ...offerForm, hours: offerForm.hours ? Number(offerForm.hours) : null });
      showTemporaryMsg("Oferta creada correctamente");
      setOfferForm({ title: "", company: "", location: "", hours: "", modality: "", details: "", startDate: "", deadline: "" });
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleDeactivateOffer = async (id) => {
    try {
      await deactivateOffer(token, id);
      showTemporaryMsg("Oferta desactivada");
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleExternalDecision = async (id, action) => {
    try {
      if (action === "approve") await approvePracticeRequest(token, id);
      else await rejectPracticeRequest(token, id);
      showTemporaryMsg(action === "approve" ? "Solicitud aprobada" : "Solicitud rechazada");
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleApplicationDecision = async (id, action) => {
    try {
      if (action === "approve") await approveApplication(token, id);
      else await rejectApplication(token, id);
      showTemporaryMsg(action === "approve" ? "Postulación aprobada" : "Postulación rechazada");
      loadAll();
    } catch (err) { setError(err.message); }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await createStudent(token, studentForm);
      
      // Mostramos un mensaje que incluya la contraseña generada
      showTemporaryMsg(`Estudiante registrado. Contraseña inicial: ${response.initialPassword}`);
      
      setStudentForm({ rut: "", name: "", email: "", career: "" });
      loadAll();
    } catch (err) { 
      setError(err.message); 
    }
  };

  const handleCreateEvaluator = async (e) => {
    e.preventDefault();
    try {
      await createEvaluator(token, evaluatorForm);
      showTemporaryMsg("¡Evaluador creado con éxito!");
      setEvaluatorForm({ name: "", email: "", specialty: "" });
      loadAll(); // Refresca la lista para el selector de abajo
    } catch (err) { setError(err.message); }
  };

  const handleAssignEvaluator = async (e) => {
    e.preventDefault();
    if(!assignForm.practiceId || !assignForm.evaluatorId) return setError("Selecciona práctica y evaluador");
    try {
      await assignEvaluatorToPractice(token, assignForm.practiceId, assignForm.evaluatorId);
      showTemporaryMsg("Evaluador asignado y notificado");
      setAssignForm({ practiceId: "", evaluatorId: "" });
      loadAll(); 
    } catch (err) { setError(err.message); }
  };

  //UI
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 px-6 flex justify-between">
        <div>
          <h1 className="text-lg font-semibold">Coordinación de Prácticas</h1>
          <p className="text-xs text-slate-300">Usuario: {name}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-medium"
        >
          Cerrar sesión
        </button>
      </header>

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
            label="Personas / Asignación"
            active={activeTab === "students"}
            onClick={() => setActiveTab("students")}
          />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <p className="text-sm text-slate-500">Cargando información…</p>
        )}
        {msg && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{msg}</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

        {/* CONTENIDO POR PESTAÑA */}
        {activeTab === "external" && (
          <section className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="font-semibold mb-4 text-slate-800 text-sm">Solicitudes de práctica externa</h2>
            {externalRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No hay solicitudes.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="py-2 text-left">Estudiante</th>
                    <th className="py-2 text-left">Empresa</th>
                    <th className="py-2 text-left">Estado</th>
                    <th className="py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {externalRequests.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-700">{r.full_name || r.name}</td>
                      <td className="py-3 text-slate-600">{r.company}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          r.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {r.status || "PENDIENTE"}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => handleExternalDecision(r.id, "approve")}
                          className="px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleExternalDecision(r.id, "reject")}
                          className="px-3 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === "offers" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 border">
              <h2 className="font-semibold mb-4 text-sm text-slate-800">Crear nueva oferta interna</h2>
              <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
                <input name="title" placeholder="Título de la oferta" value={offerForm.title} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg outline-none focus:ring-1 ring-slate-400" />
                <input name="company" placeholder="Empresa / Institución" value={offerForm.company} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg" />
                <div className="grid grid-cols-2 gap-2">
                  <input name="location" placeholder="Ubicación" value={offerForm.location} onChange={handleOfferChange} className="border p-2.5 rounded-lg" />
                  <input name="modality" placeholder="Modalidad" value={offerForm.modality} onChange={handleOfferChange} className="border p-2.5 rounded-lg" />
                </div>
                <input name="hours" placeholder="Horas semanales" type="number" value={offerForm.hours} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg" />
                <textarea name="details" placeholder="Descripción de tareas y requisitos" value={offerForm.details} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg h-24" />
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold px-1">Fecha Inicio</label>
                    <input type="date" name="startDate" value={offerForm.startDate} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold px-1">Plazo Postulación</label>
                    <input type="date" name="deadline" value={offerForm.deadline} onChange={handleOfferChange} className="w-full border p-2.5 rounded-lg text-slate-700" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-slate-800 transition">
                  Publicar Oferta
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border">
              <h2 className="font-semibold mb-4 text-sm text-slate-800">Ofertas publicadas</h2>
              {offers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10 italic">No hay ofertas registradas.</p>
              ) : (
                <ul className="space-y-3">
                  {offers.map((o) => (
                    <li key={o.id} className="border rounded-xl p-4 flex justify-between items-center bg-slate-50 border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{o.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">{o.company}</p>
                      </div>
                      <button onClick={() => handleDeactivateOffer(o.id)} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">
                        DESACTIVAR
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {activeTab === "applications" && (
          <section className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="font-semibold mb-4 text-sm">Postulaciones a ofertas internas</h2>
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500">No hay postulaciones registradas.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="py-2 text-left">Estudiante</th>
                    <th className="py-2 text-left">Oferta / Empresa</th>
                    <th className="py-2 text-left">Estado</th>
                    <th className="py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 font-medium">{a.full_name || a.student_name}</td>
                      <td className="py-3">
                        <p className="font-semibold">{a.title}</p>
                        <p className="text-[10px] text-slate-400">{a.company}</p>
                      </td>
                      <td className="py-3">
                         <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          a.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.status || "PENDIENTE"}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => handleApplicationDecision(a.id, "approve")} className="px-3 py-1 rounded bg-slate-900 text-white text-xs">Aprobar</button>
                        <button onClick={() => handleApplicationDecision(a.id, "reject")} className="px-3 py-1 rounded border border-slate-200 text-xs">Rechazar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* REGISTRAR ESTUDIANTE */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border">
                <h2 className="font-semibold mb-4 text-sm text-slate-800">1. Registrar Estudiante</h2>
                <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                  <input name="name" placeholder="Nombre completo" value={studentForm.name} onChange={handleStudentChange} className="w-full border p-2.5 rounded-lg" />
                  <input name="rut" placeholder="RUT (con puntos y guión)" value={studentForm.rut} onChange={handleStudentChange} className="w-full border p-2.5 rounded-lg" />
                  <input name="email" type="email" placeholder="Correo institucional" value={studentForm.email} onChange={handleStudentChange} className="w-full border p-2.5 rounded-lg" />
                  <input name="career" placeholder="Carrera" value={studentForm.career} onChange={handleStudentChange} className="w-full border p-2.5 rounded-lg" />
                  <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold">Crear Estudiante</button>
                </form>
              </div>

              {/* REGISTRAR EVALUADOR */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border">
                <h2 className="font-semibold mb-4 text-sm text-slate-800">2. Registrar Evaluador</h2>
                <form onSubmit={handleCreateEvaluator} className="space-y-3 text-xs">
                  <input name="name" placeholder="Nombre completo" value={evaluatorForm.name} onChange={handleEvaluatorChange} className="w-full border p-2.5 rounded-lg" />
                  <input name="email" type="email" placeholder="Correo institucional" value={evaluatorForm.email} onChange={handleEvaluatorChange} className="w-full border p-2.5 rounded-lg" />
                  <input name="specialty" placeholder="Especialidad / Departamento" value={evaluatorForm.specialty} onChange={handleEvaluatorChange} className="w-full border p-2.5 rounded-lg" />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">Crear Evaluador</button>
                </form>
              </div>
            </div>

            {/* ASIGNAR EVALUADOR */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border">
              <h2 className="font-semibold mb-4 text-sm text-slate-800">3. Asignar Evaluador a Práctica Activa</h2>
              <form onSubmit={handleAssignEvaluator} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <select name="practiceId" value={assignForm.practiceId} onChange={handleAssignChange} className="border p-2.5 rounded-lg outline-none">
                  <option value="">Seleccione Práctica / Alumno</option>
                  {openPractices.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.student_name || p.full_name || p.name || "Estudiante"}
                      {p.company_name ? ` (${p.company_name})` : ''}
                    </option>
                  ))}
                </select>

                <select name="evaluatorId" value={assignForm.evaluatorId} onChange={handleAssignChange} className="border p-2.5 rounded-lg outline-none">
                  <option value="">Seleccione Evaluador</option>
                  {evaluators.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} — {e.specialty}</option>
                  ))}
                </select>

                <button type="submit" className="bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm">
                  Asignar y Notificar
                </button>
              </form>
              <p className="mt-2 text-[10px] text-slate-400 italic">Nota: Solo aparecerán prácticas que han sido aprobadas previamente.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}