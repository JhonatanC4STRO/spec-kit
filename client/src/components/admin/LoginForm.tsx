import { useState, FormEvent, JSX } from "react";
import { login } from "../../services/auth";
import { HttpError } from "../../services/http";

interface LoginFormProps {
  onSuccess: (token: string) => void;
}

function LoginForm({ onSuccess }: LoginFormProps): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const respuesta = await login({ email, password });
      onSuccess(respuesta.token);
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        Email
        <input
          type="email"
          className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
          value={email}
          onChange={(e): void => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        Contraseña
        <input
          type="password"
          className="bg-bg-alt border border-edge text-white rounded px-3 py-2"
          value={password}
          onChange={(e): void => setPassword(e.target.value)}
        />
      </label>
      {error !== null && <p className="text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="bg-primary text-black rounded px-4 py-2 disabled:opacity-50"
      >
        Ingresar
      </button>
    </form>
  );
}

export default LoginForm;
