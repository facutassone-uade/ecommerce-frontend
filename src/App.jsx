import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import TopNav from "./components/TopNav.jsx";
import { selectToken } from "./store/authSlice.js";
import { cargarCarrito } from "./store/cartSlice.js";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Perfil from "./pages/Perfil.jsx";

function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  // Cada vez que cambia la sesión traemos (o creamos) el carrito del usuario
  useEffect(() => {
    if (!token) return;
    const carga = dispatch(cargarCarrito());
    return () => carga.abort();
  }, [token, dispatch]);

  return (
    <div className="flex min-h-svh flex-col">
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
      </Routes>
    </div>
  );
}

export default App;
