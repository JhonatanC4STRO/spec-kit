import { JSX } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getToken } from "../../services/authStore";
import LandingNavbar from "../landing/LandingNavbar";
import NavAdmin from "./NavAdmin";

function AppLayout(): JSX.Element {
  // useLocation() suscribe AppLayout al contexto del router: sin esto, el
  // elemento <AppLayout/> que pasa <Route element={...}> es referencialmente
  // estable entre navegaciones y React hace bailout del re-render, dejando
  // la nav con el token obsoleto tras login/logout.
  useLocation();
  const token: string | null = getToken();

  if (token === null) {
    // Header único público: el mismo navbar fijo de la landing.
    // pt-20 compensa la altura del navbar con position fixed.
    return (
      <div className="flex flex-col min-h-screen bg-bg-base">
        <LandingNavbar />
        <main className="flex-1 p-4 pt-20 md:p-6 md:pt-20">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      <nav className="border-b border-edge px-4 py-3 md:px-6 flex flex-col">
        <NavAdmin />
      </nav>
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
