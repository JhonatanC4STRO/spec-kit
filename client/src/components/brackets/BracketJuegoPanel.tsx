import { useState, useEffect, useCallback, JSX } from "react";
import GenerarBracketButton from "../admin/GenerarBracketButton";
import BracketView from "./BracketView";
import { getBracket } from "../../services/partidos";
import { HttpError } from "../../services/http";
import type { BracketConPartidos } from "@shared/types/bracket";
import type { Juego } from "@shared/types/inscripcion";

interface BracketJuegoPanelProps {
  juego: Juego;
  token: string;
}

function BracketJuegoPanel({ juego, token }: BracketJuegoPanelProps): JSX.Element {
  const [bracket, setBracket] = useState<BracketConPartidos | null | undefined>(undefined);

  const cargar = useCallback((): void => {
    getBracket(juego)
      .then((nuevoBracket): void => setBracket(nuevoBracket))
      .catch((err: unknown): void => {
        if (err instanceof HttpError && err.status === 404) {
          setBracket(null);
        }
      });
  }, [juego]);

  useEffect((): void => {
    cargar();
  }, [cargar]);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-bold">{juego}</h2>
      {bracket === undefined && <p>Cargando...</p>}
      {bracket === null && (
        <GenerarBracketButton juego={juego} token={token} onGenerado={cargar} />
      )}
      {bracket !== undefined && bracket !== null && (
        <BracketView bracket={bracket} token={token} onActualizado={cargar} />
      )}
    </section>
  );
}

export default BracketJuegoPanel;
