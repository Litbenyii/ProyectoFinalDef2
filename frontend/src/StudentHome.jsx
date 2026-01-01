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

  const [practiceForm, setPracticeForm] = useState({
    company: "",
    tutorName: "",
    tutorEmail: "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError("Complete al menos empresa, tutor y correo del tutor.");
      return;
    }

    try {
      setSavingExternal(true);
      await createPracticeRequest(token, practiceForm);
      setMsg("Solicitud de práctica externa enviada a coordinación.");
      setPracticeForm({
        company: "",
        tutorName: "",
        tutorEmail: "",
        startDate: "",
        endDate: "",
        details: "",
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <header className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Portal de prácticas — Estudiante</h1>
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
        {/* Mensajes */}
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

        {/* Ofertas + práctica externa */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Ofertas internas */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Ofertas de práctica internas
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Postula a las ofertas oficiales publicadas por la coordinación.
            </p>

            {loading ? (
              <p className="text-sm text-slate-500">Cargando ofertas...</p>
            ) : offers.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay ofertas disponibles por ahora.
              </p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-slate-100 rounded-xl p-4 flex flex-col gap-2 bg-slate-50/40"
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
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-white">
                        ID {offer.id}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      {offer.details || "Sin descripción"}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
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

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleApplyOffer(offer.id)}
                        disabled={applyingId === offer.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
                      >
                        {applyingId === offer.id ? "Enviando..." : "Postular"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Práctica externa */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Registrar práctica externa
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Si ya tienes una empresa confirmada, envía los datos para que la coordinación la evalúe.
            </p>

            <form onSubmit={handlePracticeSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs mb-1 text-slate-700">
                    Empresa
                  </label>
                  <input
                    type="text"
                    name="company"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                    value={practiceForm.company}
                    onChange={handlePracticeChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-700">
                      Tutor
                    </label>
                    <input
                      type="text"
                      name="tutorName"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                      value={practiceForm.tutorName}
                      onChange={handlePracticeChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-700">
                      Correo tutor
                    </label>
                    <input
                      type="email"
                      name="tutorEmail"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                      value={practiceForm.tutorEmail}
                      onChange={handlePracticeChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-700">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                      value={practiceForm.startDate}
                      onChange={handlePracticeChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-700">
                      Fecha término
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none"
                      value={practiceForm.endDate}
                      onChange={handlePracticeChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-700">
                    Detalles / actividades / stack
                  </label>
                  <textarea
                    name="details"
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900/70 outline-none resize-none"
                    value={practiceForm.details}
                    onChange={handlePracticeChange}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingExternal}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
                >
                  {savingExternal ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Mis solicitudes */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Mis solicitudes
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Postulaciones a ofertas internas y solicitudes de prácticas externas.
          </p>

          {loading ? (
            <p className="text-sm text-slate-500">Cargando...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no tienes solicitudes registradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Tipo</th>
                    <th className="text-left py-2 px-3 font-medium">Práctica / Empresa</th>
                    <th className="text-left py-2 px-3 font-medium">Fechas</th>
                    <th className="text-left py-2 px-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                          {r.type === "EXTERNAL"
                            ? "Práctica externa"
                            : "Postulación interna"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-xs font-medium text-slate-900">
                          {r.offerTitle || r.company || "Sin nombre"}
                        </div>
                        {r.company && r.offerTitle && (
                          <div className="text-[11px] text-slate-500">
                            Empresa: {r.company}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-500">
                        {r.startDate
                          ? new Date(r.startDate).toLocaleDateString("es-CL")
                          : "-"}{" "}
                        {r.endDate && " → "}
                        {r.endDate
                          ? new Date(r.endDate).toLocaleDateString("es-CL")
                          : ""}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                            r.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : r.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.status || "PEND_EVAL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
