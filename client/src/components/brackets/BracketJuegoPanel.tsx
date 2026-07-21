import { useState, useEffect, useCallback, JSX } from "react";
import GenerarBracketButton from "../admin/GenerarBracketButton";
import ReiniciarBracketButton from "../admin/ReiniciarBracketButton";
import BracketView from "./BracketView";
import { getBracket } from "../../services/partidos";
import { getListadoAdmin } from "../../services/inscripciones";
import { HttpError } from "../../services/http";
import type { BracketConPartidos } from "@shared/types/bracket";
import type { Juego } from "@shared/types/inscripcion";

interface BracketJuegoPanelProps {
  juego: Juego;
  token: string;
}

function BracketJuegoPanel({ juego, token }: BracketJuegoPanelProps): JSX.Element {
  const [bracket, setBracket] = useState<BracketConPartidos | null | undefined>(undefined);
  const [jugadoresPorId, setJugadoresPorId] = useState<Record<string, string>>({});
  const [inscritos, setInscritos] = useState<number>(0);

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

  useEffect((): void => {
    getListadoAdmin(token)
      .then((listado): void => {
        const mapa: Record<string, string> = {};
        for (const jugador of [...listado.FC25, ...listado.COD_BO2]) {
          mapa[jugador.id] = jugador.nombreCompleto;
        }
        setJugadoresPorId(mapa);
        setInscritos(listado[juego].length);
      })
      .catch((): void => undefined);
  }, [token, juego]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white">
          Bracket {juego}
        </h1>
        {bracket !== undefined && bracket !== null && (
          <ReiniciarBracketButton
            juego={juego}
            token={token}
            onReiniciado={(): void => setBracket(null)}
          />
        )}
      </div>
      {bracket === undefined && <p className="text-text-secondary">Cargando...</p>}
      {bracket === null && (
        <div className="bg-bg-card border border-edge rounded p-6 flex flex-col gap-3 items-start">
          <p className="text-text-secondary">
            Todavía no se generó el bracket de {juego}.
          </p>
          <GenerarBracketButton juego={juego} token={token} inscritos={inscritos} onGenerado={cargar} />
        </div>
      )}
      {bracket !== undefined && bracket !== null && (
        <BracketView
          bracket={bracket}
          token={token}
          onActualizado={cargar}
          jugadoresPorId={jugadoresPorId}
        />
      )}
    </section>
  );
}

export default BracketJuegoPanel;
