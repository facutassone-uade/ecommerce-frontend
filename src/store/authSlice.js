import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authService from "../services/authService.js";
import { aErrorSerializable } from "./errores.js";

export const CLAVE_SESION = "sesion";

const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
};

const guardarSesion = (data) => {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(data));
  return data;
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return guardarSesion(await authService.login(email, password));
    } catch (err) {
      return rejectWithValue(aErrorSerializable(err));
    }
  },
);

export const registrar = createAsyncThunk(
  "auth/registrar",
  async (datos, { rejectWithValue }) => {
    try {
      return guardarSesion(await authService.registrar(datos));
    } catch (err) {
      return rejectWithValue(aErrorSerializable(err));
    }
  },
);

// usuario = AuthResponseDTO del back (incluye el token JWT)
const initialState = {
  usuario: leerSesion(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Borrar la sesión de localStorage lo hace el listener en store.js
    logout: (state) => {
      state.usuario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.usuario = action.payload;
      })
      .addCase(registrar.fulfilled, (state, action) => {
        state.usuario = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export const selectUsuario = (state) => state.auth.usuario;
export const selectToken = (state) => state.auth.usuario?.token;
export const selectCustomerId = (state) => state.auth.usuario?.customerId;
export const selectEsAdmin = (state) => state.auth.usuario?.role === "ADMIN";

export default authSlice.reducer;
