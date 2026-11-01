import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import RutaAdmin from "./RutaAdmin.jsx";

function AdminLayout() {
  return (
    <RutaAdmin>
      <div className="flex min-h-svh flex-col md:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-10">
          <Outlet />
        </main>
      </div>
    </RutaAdmin>
  );
}

export default AdminLayout;
