import React, { useEffect, useState } from "react";
import {
  getOffers,
  getMyRequests,
  createPracticeRequest,
  createApplication,
} from "./api";

export default function StudentHome({ name, onLogout, token }) {
  const [offers, setOffers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [savingExternal, setSavingExternal] = useState(false);

  // Estados nuevos para la Bitácora
  const [logbookFile, setLogbookFile] = useState(null);
  const [logbookDesc, setLogbookDesc] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

  const [practiceForm, setPracticeForm] = useState({
      company: "",
      tutorName: "",
      tutorEmail: "",
      location: "",
      modality: "",
      startDate: "",
      endDate: "",
      details: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      const [offersData, requestsData] = await Promise.all([
        getOffers(token),
        getMyRequests(token),
      ]);

      setOffers(Array.isArray(offersData) ? offersData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const handlePracticeChange = (e) => {
    const { name, value } = e.target;
    setPracticeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePracticeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!practiceForm.company || !practiceForm.tutorName || !practiceForm.tutorEmail) {
      setError("Complete empresa, tutor y correo del tutor.");
      return;
    }

    try{
      setSavingExternal(true);

      await createPracticeRequest(token, {
        company: practiceForm.company,
        tutorName: practiceForm.tutorName,
        tutorEmail: practiceForm.tutorEmail,
        startDate: practiceForm.startDate || null,
        endDate: practiceForm.endDate || null,
        details: practiceForm.details || "",
        location: practiceForm.location || null,
        modality: practiceForm.modality || null,
      });

      setMsg("Solicitud de práctica externa enviada.");
      setPracticeForm({
        company: "",
        tutorName: "",
        tutorEmail: "",
        startDate: "",
        endDate: "",
        details: "",
        location: "",
        modality: "",
      });
      await loadData();
    } catch (err) {
      setError(err.message || "Error al enviar práctica externa");
    } finally {
      setSavingExternal(false);
    }
  };

  const handleApplyOffer = async (offerId) => {
    setError("");
    setMsg("");
    try {
      setApplyingId(offerId);
      await createApplication(token, offerId);
      setMsg("Postulación enviada correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message || "Error al postular");
    } finally {
      setApplyingId(null);
    }
  };

  //NUEVA FUNCIÓN: Subir Bitácora
  const handleLogbookUpload = async (practiceId) => {
    if (!logbookFile) {
      setError("Por favor, selecciona un archivo primero.");
      return;
    }
    setError("");
    setMsg("");
    setUploadingId(practiceId);

    const formData = new FormData();
    formData.append("logbook", logbookFile);
    formData.append("practiceId", practiceId);
    formData.append("description", logbookDesc);

    try {
      // Usamos fetch directamente para manejar el multipart/form-data con el token
      const response = await fetch("http://localhost:4000/api/student/my/logbooks", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir la bitácora.");

      setMsg("Bitácora subida con éxito.");
      setLogbookFile(null);
      setLogbookDesc("");
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">
            Portal de prácticas — Estudiante
          </h1>
          <p className="text-xs text-slate-200">Conectado como {name}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-slate-900 hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {(msg || error) && (
          <div>
            {msg && (
              <div className="mb-2 p-2 text-sm bg-emerald-50 text-emerald-700 rounded">
                {msg}
              </div>
            )}
            {error && (
              <div className="p-2 text-sm bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Ofertas internas */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="font-semibold mb-4">Ofertas internas</h2>

            {loading ? (
              <p className="text-sm text-slate-500">Cargando…</p>
            ) : offers.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay ofertas disponibles.
              </p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-4 rounded-xl border bg-slate-50"
                  >
                    <div className="flex justify-between mb-1">
                      <div>
                        <p className="font-semibold">{offer.title}</p>
                        <p className="text-xs text-slate-500">
                          {offer.company}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyOffer(offer.id)}
                        disabled={applyingId === offer.id}
                        className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded disabled:opacity-50"
                      >
                        {applyingId === offer.id ? "Enviando…" : "Postular"}
                      </button>
                    </div>
                    {offer.details && (
                      <p className="text-xs text-slate-600">
                        {offer.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Práctica externa */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border">
            <h2 className="font-semibold mb-4">Práctica externa</h2>

            <form onSubmit={handlePracticeSubmit} className="space-y-3">
              <input
                name="company"
                placeholder="Empresa"
                value={practiceForm.company}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              />
              <input
                name="tutorName"
                placeholder="Tutor"
                value={practiceForm.tutorName}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              />
              <input
                name="tutorEmail"
                type="email"
                placeholder="Correo tutor"
                value={practiceForm.tutorEmail}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              />
              <input
                name="location"
                placeholder="Ciudad / Ubicación"
                value={practiceForm.location}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              />
              <select
                name="modality"
                value={practiceForm.modality}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="">Seleccione modalidad</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrida">Híbrida</option>
                <option value="Remota">Remota</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={practiceForm.startDate}
                  onChange={handlePracticeChange}
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="date"
                  name="endDate"
                  value={practiceForm.endDate}
                  onChange={handlePracticeChange}
                  className="w-full border p-2 rounded text-sm"
                />
              </div>

              <textarea
                name="details"
                placeholder="Detalles"
                value={practiceForm.details}
                onChange={handlePracticeChange}
                className="w-full border p-2 rounded text-sm"
              />

              <button
                type="submit"
                disabled={savingExternal}
                className="w-full bg-slate-900 text-white py-2 rounded text-sm disabled:opacity-50"
              >
                {savingExternal ? "Enviando…" : "Enviar solicitud"}
              </button>
            </form>
          </div>
        </section>

        {/* Mis solicitudes con Bitácoras */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border">
          <h2 className="font-semibold mb-4">Mis solicitudes y procesos</h2>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-slate-500">Sin registros.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div key={r.id} className="border rounded-xl overflow-hidden">
                  <div className="p-4 bg-slate-50 flex justify-between items-center border-b">
                    <div>
                      <p className="font-bold text-sm">{r.company || r.offerTitle}</p>
                      <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                        {r.type === "EXTERNAL" ? "Solicitud Externa" : "Oferta Interna"}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      r.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' : 
                      r.status === 'Rechazada' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.status?.toUpperCase() || "PENDIENTE"}
                    </span>
                  </div>

                  {/* SECCIÓN DE BITÁCORA (Solo si está aprobada) */}
                  {r.status === 'Aprobada' && (
                    <div className="p-4 bg-white space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded text-xs font-medium">
                        <span>ℹ️ Tu práctica está aprobada. Sube aquí tus avances (Bitácora).</span>
                      </div>
                      
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">ARCHIVO (PDF/Word)</label>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setLogbookFile(e.target.files[0])}
                            className="text-xs block w-full file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">COMENTARIO BREVE</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Informe semana 1"
                            value={logbookDesc}
                            onChange={(e) => setLogbookDesc(e.target.value)}
                            className="w-full border p-1.5 rounded text-xs"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleLogbookUpload(r.id)}
                        disabled={uploadingId === r.id}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-2 rounded text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        {uploadingId === r.id ? "Subiendo..." : "Enviar Bitácora"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}