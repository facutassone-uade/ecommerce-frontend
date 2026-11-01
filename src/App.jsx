import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminCategorias from "./pages/admin/AdminCategorias.jsx";
import AdminOrdenes from "./pages/admin/AdminOrdenes.jsx";
import AdminProductos from "./pages/admin/AdminProductos.jsx";
import { selectEsAdmin, selectToken } from "./store/authSlice.js";
import { cargarCarrito } from "./store/cartSlice.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Perfil from "./pages/Perfil.jsx";

// Las pantallas de la tienda llevan el TopNav; las del admin tienen su propio layout con sidebar
function LayoutTienda() {
  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <Outlet />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const esAdmin = useSelector(selectEsAdmin);

  // Cada vez que cambia la sesión traemos (o creamos) el carrito del usuario.
  // El admin no compra: si no, cada login le crearía un carrito que aparece en el listado.
  useEffect(() => {
    if (!token || esAdmin) return;
    const carga = dispatch(cargarCarrito());
    return () => carga.abort();
  }, [token, esAdmin, dispatch]);

  return (
    <Routes>
      <Route element={<LayoutTienda />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="ordenes" element={<AdminOrdenes />} />
      </Route>
    </Routes>
  );
}

export default App;
