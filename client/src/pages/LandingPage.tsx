import { JSX, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import TournamentInfo from "../components/landing/TournamentInfo";
import LandingInscripcionForm from "../components/landing/LandingInscripcionForm";
import Footer from "../components/landing/Footer";

function LandingPage(): JSX.Element {
  const location = useLocation();

  // Scroll a la sección solicitada cuando se llega desde otra página vía navbar
  useEffect((): void => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo !== undefined) {
      document.getElementById(state.scrollTo)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  return (
    <div id="inicio" style={{ fontFamily: "'Inter', sans-serif" }}>
      <LandingNavbar />
      <Hero />
      <TournamentInfo />
      <LandingInscripcionForm />
      <Footer />
    </div>
  );
}

export default LandingPage;
