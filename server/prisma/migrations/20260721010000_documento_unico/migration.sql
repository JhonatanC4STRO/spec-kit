-- Documento único por juego: evita inscribir dos jugadores FC25 con el mismo
-- número de documento. En COD_BO2 el documento es NULL y Postgres trata los
-- NULL como distintos, así que no genera conflictos en ese juego.
CREATE UNIQUE INDEX "Inscripcion_juego_documento_key" ON "Inscripcion"("juego", "documento");
