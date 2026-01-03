const API_URL = "http://localhost:4000";

/**
 * Helper genérico para peticiones fetch
 */
async function request(path, options = {}) {
  const { headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    let msg = "Error en la solicitud";
    let data = null;

    try {
      data = await res.json();
      msg = data.message || data.error || msg;
    } catch (e) {
      // Error silencioso si no es JSON
    }

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") window.location.href = "/";
    }

    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// --- AUTH ---
export const login = (email, password) => 
  request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

// --- ESTUDIANTE ---
export const getOffers = (token) => 
  request("/api/student/offers", { headers: { Authorization: `Bearer ${token}` } });

export const getMyRequests = (token) => 
  request("/api/student/my/requests", { headers: { Authorization: `Bearer ${token}` } });

export const createPracticeRequest = (token, data) => 
  request("/api/student/practice-requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const createApplication = (token, offerId) => 
  request(`/api/student/applications/${offerId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

// --- COORDINACIÓN: SOLICITUDES Y POSTULACIONES ---
export const getCoordinatorPracticeRequests = (token) => 
  request("/api/coord/external-requests", { headers: { Authorization: `Bearer ${token}` } });

export const approvePracticeRequest = (token, id) => 
  request(`/api/coord/external-requests/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

export const rejectPracticeRequest = (token, id) => 
  request(`/api/coord/external-requests/${id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

export const getCoordinatorApplications = (token) => 
  request("/api/coord/applications", { headers: { Authorization: `Bearer ${token}` } });

export const approveApplication = (token, id) => 
  request(`/api/coord/applications/${id}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

export const rejectApplication = (token, id) => 
  request(`/api/coord/applications/${id}/reject`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

// --- COORDINACIÓN: OFERTAS ---
export const getCoordOffers = (token) => 
  request("/api/coord/offers", { headers: { Authorization: `Bearer ${token}` } });

export const createOffer = (token, data) => 
  request("/api/coord/offers", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const deactivateOffer = (token, id) => 
  request(`/api/coord/offers/${id}/deactivate`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });

// --- COORDINACIÓN: GESTIÓN DE PERSONAS ---
export const createStudent = (token, data) => 
  request("/api/coord/students", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const createEvaluator = (token, data) => 
  request("/api/coord/evaluators", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });

export const getEvaluators = (token) => 
  request("/api/coord/evaluators", { headers: { Authorization: `Bearer ${token}` } });

// --- COORDINACIÓN: PRÁCTICAS Y ASIGNACIÓN ---
export const getOpenPractices = (token) => 
  request("/api/coord/practices/open", { headers: { Authorization: `Bearer ${token}` } });

export const assignEvaluatorToPractice = (token, practiceId, evaluatorId) => 
  request(`/api/coord/practices/${practiceId}/assign`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ evaluatorId }),
  });

export const finalizePractice = (token, practiceId) => 
  request(`/api/coord/practices/${practiceId}/close`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });