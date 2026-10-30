# ecommerce-frontend

Frontend de la app de e-commerce (React + Vite) para el TP de Aplicaciones Interactivas (UADE).

Repo backend: https://github.com/facutassone-uade/ecommerce-backend

## Qué es

Una tienda online de artículos para el hogar ("Tienda UADE"). El usuario puede:

- Ver el catálogo de productos, filtrarlo por categoría y buscar por nombre.
- Entrar al detalle de cada producto (imagen, descripción, stock).
- Registrarse e iniciar sesión (JWT que devuelve el back).
- Armar su carrito: agregar productos, cambiar cantidades, quitar, vaciar y elegir fecha de entrega.
- Hacer el checkout eligiendo método de pago, lo que genera una orden en el back.

El carrito vive en el backend (asociado al cliente), así que se mantiene entre sesiones y dispositivos.

## Stack

- React 19 + Vite
- React Router para las rutas
- Redux Toolkit + React Redux para el estado global (sesión y carrito)
- Tailwind CSS + componentes de shadcn/ui (Radix) y íconos de lucide-react

## Cómo levantarlo

1. Levantar el backend en `http://localhost:8080` (ver el README del repo del back: necesita MySQL y la variable `JWT_SECRET`).
2. Instalar dependencias y correr el front:

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`. Vite redirige todo lo que empieza con `/api` al backend (proxy en `vite.config.js`), así que no hay que configurar CORS.

Otros scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Estructura

```
src/
├── main.jsx            punto de entrada: Provider de Redux + BrowserRouter
├── App.jsx             rutas y carga del carrito cuando cambia la sesión
├── pages/              una pantalla por ruta (Home, ProductoDetalle, Cart, Checkout, Login, Registro)
├── components/         componentes propios (TopNav, CartItem, OrderSummary...) y ui/ de shadcn
├── store/              estado global con Redux Toolkit
├── hooks/              useAuth y useCart: la API que usan las pantallas para hablar con el store
├── services/           llamadas fetch al backend, una por recurso
└── utils/              validaciones y helpers
```

## Estado global con Redux

El estado compartido (sesión y carrito) estaba en dos Context de React (`AuthProvider` y `CartProvider`). Lo migramos a Redux Toolkit para centralizarlo, evitar renders de más y no repetir el manejo de errores en cada pantalla.

- `store/store.js`: arma el store con los reducers `auth` y `cart` y un listener middleware que:
  - borra la sesión de `localStorage` cuando se despacha `logout`;
  - cierra la sesión automáticamente si cualquier operación del carrito responde **401** (token vencido o inválido). Antes cada página tenía su propio `if (err.status === 401) logout()`.
- `store/authSlice.js`: guarda el `usuario` (respuesta del login, incluye el token). Thunks `login` y `registrar`, acción `logout`. Al iniciar, lee la sesión guardada en `localStorage`.
- `store/cartSlice.js`: guarda el carrito del back, `cargando` y `error`. Un thunk por operación (`cargarCarrito`, `agregar`, `eliminar`, `cambiarCantidad`, `vaciar`, `cambiarFechaEntrega`, `confirmarCompra`) y selectores como `selectItems` o `selectCantidadTotal`. Al hacer logout el carrito se limpia.
- `store/errores.js`: convierte los errores a `{ message, status }`, porque Redux no guarda instancias de `Error`.

Las pantallas no usan el store directamente: siguen llamando a `useAuth()` y `useCart()`, que por dentro usan `useSelector` / `useDispatch` y devuelven lo mismo que devolvían los Context. Las acciones devuelven una promesa (`unwrap()`), así que en la pantalla se sigue haciendo `try { await agregar(id) } catch (err) { ... }`.

El estado de cada pantalla (formularios, mensajes, cantidad elegida, método de pago) sigue en `useState`: solo va a Redux lo que se comparte entre pantallas.
