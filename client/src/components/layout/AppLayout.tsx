import { JSX } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getToken } from "../../services/authStore";
import NavPublica from "./NavPublica";
import NavAdmin from "./NavAdmin";

function AppLayout(): JSX.Element {
  // useLocation() suscribe AppLayout al contexto del router: sin esto, el
  // elemento <AppLayout/> que pasa <Route element={...}> es referencialmente
  // estable entre navegaciones y React hace bailout del re-render, dejando
  // la nav con el token obsoleto tras login/logout.
  useLocation();
  const token: string | null = getToken();

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      <nav className="border-b border-edge px-6 py-3">
        {token === null ? <NavPublica /> : <NavAdmin />}
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
