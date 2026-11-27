import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authService from "../services/authService.js";
import { aErrorSerializable } from "./errores.js";

const normalizarUsuario = (data) => ({
  userId: data.userId,
  customerId: data.customerId,
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  role: data.role,
});

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return normalizarUsuario(await authService.login(email, password));
    } catch (err) {
      return rejectWithValue(aErrorSerializable(err));
    }
  },
);

export const registrar = createAsyncThunk(
  "auth/registrar",
  async (datos, { rejectWithValue }) => {
    try {
      return normalizarUsuario(await authService.registrar(datos));
    } catch (err) {
      return rejectWithValue(aErrorSerializable(err));
    }
  },
);

export const restaurarSesion = createAsyncThunk(
  "auth/restaurarSesion",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem("sesion");
      return normalizarUsuario(await authService.obtenerUsuarioActual());
    } catch (err) {
      if (err.status === 401) return null;
      return rejectWithValue(aErrorSerializable(err));
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.restaurando,
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.cerrarSesion();
  } catch (err) {
    return rejectWithValue(aErrorSerializable(err));
  }
});

const initialState = {
  usuario: null,
  inicializando: true,
  restaurando: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sesionInvalidada: (state) => {
      state.usuario = null;
      state.inicializando = false;
      state.restaurando = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restaurarSesion.pending, (state) => {
        state.inicializando = true;
        state.restaurando = true;
        state.error = null;
      })
      .addCase(restaurarSesion.fulfilled, (state, action) => {
        if (!state.restaurando) return;
        state.usuario = action.payload;
        state.inicializando = false;
        state.restaurando = false;
      })
      .addCase(restaurarSesion.rejected, (state, action) => {
        if (!state.restaurando) return;
        state.usuario = null;
        state.inicializando = false;
        state.restaurando = false;
        state.error = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.usuario = action.payload;
        state.inicializando = false;
        state.restaurando = false;
        state.error = null;
      })
      .addCase(registrar.fulfilled, (state, action) => {
        state.usuario = action.payload;
        state.inicializando = false;
        state.restaurando = false;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.usuario = null;
        state.inicializando = false;
        state.restaurando = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { sesionInvalidada } = authSlice.actions;

export const selectUsuario = (state) => state.auth.usuario;
export const selectCustomerId = (state) => state.auth.usuario?.customerId;
export const selectEsAdmin = (state) => state.auth.usuario?.role === "ADMIN";

export default authSlice.reducer;
