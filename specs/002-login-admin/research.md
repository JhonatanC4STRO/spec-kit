# Research: Login de Administrador

## 1. Framework de testing

**Decision**: Vitest, igual que el resto del proyecto.

**Rationale**: Consistencia con 001 y 005; soporte nativo TS/ESM.

**Alternatives considered**: Jest — descartado por consistencia.

## 2. Implementación manual de JWT (sin librería de terceros)

**Decision**: Firmar y verificar el token a mano usando el módulo `crypto`
nativo de Node: `token = base64url(header) + "." + base64url(payload) + "." +
base64url(HMAC-SHA256(header + "." + payload, SECRET))`. El `payload`
incluye `{ adminId, iat, exp }`, con `exp = iat + 600` (10 minutos en
segundos). Verificar recalcula la firma con el mismo secreto y la compara con
`crypto.timingSafeEqual` (evita timing attack en la comparación de firma), y
rechaza si `exp` ya pasó.

**Rationale**: La constitución especifica "JWT manual con bcrypt" como parte
del stack — explícitamente no una librería de autenticación de terceros
(`jsonwebtoken`, `next-auth`, etc.), que requeriría aprobación previa no
otorgada. El módulo `crypto` es parte del runtime de Node, no es una
dependencia nueva.

**Alternatives considered**:
- Paquete npm `jsonwebtoken`: viola el principio V (no instalar librerías sin
  aprobar) y contradice "manual" del stack.
- Sesiones persistidas en DB/Redis en lugar de JWT stateless: agrega
  infraestructura (Redis) no aprobada para una sesión de solo 10 minutos.

## 3. Hash de contraseña

**Decision**: `bcrypt` con costo 10 (default de la librería) para
`passwordHash` de `Administrador`.

**Rationale**: `bcrypt` ya está nombrado explícitamente en la constitución;
costo 10 es estándar y adecuado al bajo volumen de cuentas admin de este
proyecto.

**Alternatives considered**: costo 12+ — innecesario para este volumen,
aumenta latencia de login sin beneficio real dado el contexto.

## 4. Mensaje de error genérico sin filtrar por timing (FR-005)

**Decision**: Cuando el email no corresponde a ningún administrador, el
backend igualmente ejecuta `bcrypt.compare` contra un hash dummy
precalculado antes de responder el mismo mensaje de error genérico que
cuando la contraseña es incorrecta.

**Rationale**: Sin este paso, la respuesta sería más rápida cuando el email
no existe (no hay `bcrypt.compare` real), lo que permite inferir por timing
qué emails están registrados — un side-channel que el spec busca evitar al
pedir "el mismo mensaje de error genérico" (FR-005).

**Alternatives considered**: responder inmediatamente sin comparación cuando
el email no existe — más simple pero filtra existencia de cuentas por
latencia.
