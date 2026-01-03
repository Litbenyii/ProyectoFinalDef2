import { useState } from "react";
import Login from "./Login";
import StudentHome from "./StudentHome";
import CoordinationHome from "./CoordinationHome";

// ⛔ MODO PREVIEW DESACTIVADO (usar backend real)
const PREVIEW_MODE = false;


function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin = (data) => {
    const { user, token } = data;

    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // ===============================
  // PREVIEW (solo si lo activas)
  // ===============================
  const previewUser = {
    email: "admin@preview.cl",
    role: "COORDINATION",
    name: "Admin Preview",
  };
  const previewToken = "FAKE_TOKEN";

  const activeUser = PREVIEW_MODE ? previewUser : user;
  const activeToken = PREVIEW_MODE ? previewToken : token;

  // ===============================
  // RENDER
  // ===============================

  // No autenticado
  if (!activeUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Estudiante
  if (activeUser.role === "STUDENT") {
    return (
      <StudentHome
        name={activeUser.name || activeUser.email}
        token={activeToken}
        onLogout={handleLogout}
      />
    );
  }

  // Coordinación
  if (activeUser.role === "COORDINATION") {
    return (
      <CoordinationHome
        name={activeUser.name || activeUser.email}
        token={activeToken}
        onLogout={handleLogout}
      />
    );
  }

  // Rol inválido
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full text-center border border-slate-100">
        <div className="bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-amber-600">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Tu rol <strong>{activeUser.role}</strong> no tiene permisos.
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default App;;
