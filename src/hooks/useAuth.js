import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as auth from "../store/authSlice.js";

export const useAuth = () => {
  const dispatch = useDispatch();
  const usuario = useSelector(auth.selectUsuario);

  const login = useCallback(
    (email, password) => dispatch(auth.login({ email, password })).unwrap(),
    [dispatch],
  );
  const registrar = useCallback((datos) => dispatch(auth.registrar(datos)).unwrap(), [dispatch]);
  const logout = useCallback(() => dispatch(auth.logout()), [dispatch]);

  return { usuario, login, registrar, logout };
};
