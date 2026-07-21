import { JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import InscripcionPage from "./pages/InscripcionPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminJugadoresPage from "./pages/AdminJugadoresPage";
import AdminBracketFc25Page from "./pages/AdminBracketFc25Page";
import AdminBracketCodPage from "./pages/AdminBracketCodPage";
import LandingPage from "./pages/LandingPage";
import PublicBracketFcPage from "./pages/PublicBracketFcPage";
import PublicBracketCodPage from "./pages/PublicBracketCodPage";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* La raíz redirige a la landing */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/inscripcion" element={<InscripcionPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/jugadores" element={<AdminJugadoresPage />} />
          <Route path="/admin/bracket/fc25" element={<AdminBracketFc25Page />} />
          <Route path="/admin/bracket/cod-bo2" element={<AdminBracketCodPage />} />
          {/* Vistas públicas (solo lectura) */}
          <Route path="/bracket/fc25" element={<PublicBracketFcPage />} />
          <Route path="/bracket/cod-bo2" element={<PublicBracketCodPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
