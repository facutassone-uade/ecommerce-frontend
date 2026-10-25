import { useState } from "react";
import { AuthContext } from "./AuthContext.js";
import * as authService from "../services/authService.js";

const CLAVE = "sesion";

const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
};

function AuthProvider({ children }) {
  // usuario = AuthResponseDTO del back (incluye el token JWT)
  const [usuario, setUsuario] = useState(leerSesion);

  const guardar = (data) => {
    localStorage.setItem(CLAVE, JSON.stringify(data));
    setUsuario(data);
    return data;
  };

  const login = async (email, password) => guardar(await authService.login(email, password));

  const registrar = async (datos) => guardar(await authService.registrar(datos));

  const logout = () => {
    localStorage.removeItem(CLAVE);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
