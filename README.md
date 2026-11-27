# ecommerce-frontend

Frontend de la app de e-commerce (React + Vite) para el TP de Aplicaciones Interactivas (UADE).

Repo backend: https://github.com/facutassone-uade/back-ecommerce

## Qué es

Una tienda online de artículos para el hogar ("Tienda UADE"). El usuario puede:

- Ver el catálogo de productos, filtrarlo por categoría y buscar por nombre.
- Entrar al detalle de cada producto (imagen, descripción, stock).
- Registrarse e iniciar sesión (el back guarda el JWT en una cookie `HttpOnly`).
- Armar su carrito: agregar productos, cambiar cantidades, quitar, vaciar y elegir fecha de entrega.
- Hacer el checkout eligiendo método de pago, lo que genera una orden en el back.
- Ver el historial de sus compras en **Mis órdenes** (`/ordenes`, `GET /api/orders/user/{userId}`), con filtro de pendientes de pago y detalle de cada orden.

El carrito vive en el backend (asociado al cliente), así que se mantiene entre sesiones y dispositivos.

Un usuario con rol **ADMIN** entra a un panel propio (`/admin`) para administrar productos, categorías, órdenes, carritos y clientes (ver [Panel admin](#panel-admin)).

## Stack

- React 19 + Vite
- React Router para las rutas
- Redux Toolkit + React Redux para el estado global (sesión y carrito)
- Tailwind CSS + componentes de shadcn/ui (Radix) y íconos de lucide-react

## Cómo levantarlo

1. Levantar el backend en `http://localhost:8080` usando la rama [`feature/add-cookie`](https://github.com/facutassone-uade/back-ecommerce/tree/feature/add-cookie) (ver el README del repo del back: necesita MySQL y la variable `JWT_SECRET`). La rama `main` todavía usa el header `Authorization` y no es compatible con este flujo de cookies.
2. Instalar dependencias y correr el front:

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`. Vite redirige todo lo que empieza con `/api` al backend (proxy en `vite.config.js`), así que en desarrollo las llamadas salen al mismo origen. Igual el back tiene CORS configurado (`SecurityConfig`) para `localhost:3000` y `localhost:5173`, por si se llama a la API directo.

Otros scripts: `npm run build`, `npm run lint`, `npm run preview`.

## Estructura

```
src/
├── main.jsx            punto de entrada: Provider de Redux + BrowserRouter
├── App.jsx             rutas y carga del carrito cuando cambia la sesión
├── pages/              una pantalla por ruta (Home, ProductoDetalle, Cart, Checkout, Ordenes, Login, Registro)
│   └── admin/          pantallas del panel admin (AdminProductos, AdminCategorias, AdminOrdenes...)
├── components/         componentes propios (TopNav, CartItem, OrderSummary...) y ui/ de shadcn
│   └── admin/          layout con sidebar, guard de rol y diálogos del panel admin
├── store/              estado global con Redux Toolkit
├── hooks/              useAuth y useCart: la API que usan las pantallas para hablar con el store; useListado para las tablas del admin
├── services/           llamadas fetch al backend, una por recurso (api.js: llamadas autenticadas con cookie)
└── utils/              validaciones y helpers (formato de precios y fechas, métodos de pago)
```

## Estado global con Redux

El estado compartido (sesión y carrito) estaba en dos Context de React (`AuthProvider` y `CartProvider`). Lo migramos a Redux Toolkit para centralizarlo, evitar renders de más y no repetir el manejo de errores en cada pantalla.

- `store/store.js`: arma el store con los reducers `auth` y `cart` y un listener middleware que limpia el estado cuando una operación responde **401**.
- `store/authSlice.js`: mantiene los datos del usuario en Redux; `login`, `registrar`, `restaurarSesion` (consulta `/api/auth/me`) y `logout` (llama a `/api/auth/logout`).
- `store/cartSlice.js`: guarda el carrito del back, `cargando` y `error`. Un thunk por operación (`cargarCarrito`, `agregar`, `eliminar`, `cambiarCantidad`, `vaciar`, `cambiarFechaEntrega`, `confirmarCompra`) y selectores como `selectItems` o `selectCantidadTotal`. Al hacer logout el carrito se limpia.
- `store/errores.js`: convierte los errores a `{ message, status }`, porque Redux no guarda instancias de `Error`.

Las pantallas no usan el store directamente: siguen llamando a `useAuth()` y `useCart()`, que por dentro usan `useSelector` / `useDispatch` y devuelven lo mismo que devolvían los Context. Las acciones devuelven una promesa (`unwrap()`), así que en la pantalla se sigue haciendo `try { await agregar(id) } catch (err) { ... }`.

El estado de cada pantalla (formularios, mensajes, cantidad elegida, método de pago) sigue en `useState`: solo va a Redux lo que se comparte entre pantallas.

El backend de la rama `feature/add-cookie` establece el JWT en una cookie `HttpOnly` durante login/registro. El frontend no lee ni guarda el JWT: el navegador adjunta la cookie a las peticiones autenticadas (`credentials: "include"`). Al iniciar, `/api/auth/me` restaura los datos del usuario en Redux y `/api/auth/logout` vence la cookie. En el primer inicio también se elimina el token legado de la clave `sesion` en `localStorage`, sin leerlo. La cookie `HttpOnly` reduce la exposición del JWT ante XSS, y `index.html` añade una CSP que bloquea scripts inline y scripts de otros orígenes. El contenido de la API se muestra con JSX (que escapa texto) y no se encontraron inserciones de HTML crudo en el frontend. No hay preferencias configurables de tema o idioma en la app para persistir.

## Panel admin

Sigue el wireflow "03 Wireflow · Admin" del Penpot del proyecto. Para probarlo, el back crea al iniciar un usuario `admin@example.com` con rol ADMIN (ver `DataInitializer` en el repo del back).

- **Acceso**: al iniciar sesión con rol ADMIN se entra directo a `/admin/productos`. Todas las rutas `/admin/*` pasan por `RutaAdmin`: sin sesión manda al login (y vuelve al ingresar) y con rol USER manda a la tienda. El rol sale del `role` que devuelve el login (`selectEsAdmin` en `authSlice`). El admin no carga carrito, porque no compra.
- **Layout**: `AdminLayout` reemplaza el `TopNav` por `AdminSidebar` (Productos, Categorías, Órdenes, Carritos, Clientes y Cerrar sesión). El `UserMenu` de la tienda muestra "Panel admin" solo al ADMIN.

| Pantalla | Qué hace | Endpoints |
| --- | --- | --- |
| Productos | Tabla con búsqueda y paginado; diálogo para crear/editar (datos, URL de imagen y categorías) | `GET/POST/PUT/DELETE /api/products`, `POST/DELETE /api/products/{id}/categories/{categoryId}` |
| Categorías | Tabla y formulario al costado que pasa a modo edición con el lápiz | `GET/POST/PUT/DELETE /api/categories` |
| Órdenes | Tabla con búsqueda por cliente o número; diálogo para marcar pagada, cambiar método de pago, agregar/quitar ítems o eliminar | `GET /api/orders`, `PUT/DELETE /api/orders/{id}`, `POST/DELETE /api/orders/{id}/items` |
| Carritos | Carritos activos de todos los clientes, detalle de solo lectura y baja | `GET /api/carts`, `GET/DELETE /api/carts/{id}` |
| Clientes | Tabla con búsqueda por nombre, DNI o teléfono, detalle y baja con confirmación | `GET /api/customers`, `GET/DELETE /api/customers/{id}` |

Decisiones:

- Las tablas del admin no usan Redux: cada pantalla carga su listado con `useListado` y lo actualiza en `useState` después de crear, editar o borrar, porque esos datos no se comparten con otras pantallas. Si el back responde 401, `useListado` cierra la sesión.
- En los diálogos de producto y de orden los cambios (categorías, ítems) se mandan recién al guardar, así "Cancelar" no deja nada a medias. El back no recalcula el total de la orden al tocar los ítems, así que el front lo calcula y lo manda en el `PUT`.
- No hay "Nueva orden" en el admin: las órdenes las generan los clientes al confirmar la compra.
- Todas las bajas piden confirmación (`ConfirmarEliminar`). Si el back la rechaza (por ejemplo, un cliente con órdenes), el error se muestra en el mismo diálogo.
- `GET /api/customers` y el nombre y apellido en `CustomerResponseDTO` se agregaron al back para la pantalla de clientes.
