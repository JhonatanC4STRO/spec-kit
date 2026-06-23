import { JSX } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import InscripcionPage from "./pages/InscripcionPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminJugadoresPage from "./pages/AdminJugadoresPage";
import AdminBracketFc25Page from "./pages/AdminBracketFc25Page";
import AdminBracketCodPage from "./pages/AdminBracketCodPage";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<InscripcionPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/jugadores" element={<AdminJugadoresPage />} />
          <Route path="/admin/bracket/fc25" element={<AdminBracketFc25Page />} />
          <Route path="/admin/bracket/cod-bo2" element={<AdminBracketCodPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
