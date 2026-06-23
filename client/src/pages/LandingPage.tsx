import { JSX } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import TournamentInfo from "../components/landing/TournamentInfo";
import LandingInscripcionForm from "../components/landing/LandingInscripcionForm";
import Footer from "../components/landing/Footer";

function LandingPage(): JSX.Element {
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
