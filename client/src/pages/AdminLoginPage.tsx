import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/admin/LoginForm";
import { setToken } from "../services/authStore";

function AdminLoginPage(): JSX.Element {
  const navigate = useNavigate();

  function handleSuccess(token: string): void {
    setToken(token);
    navigate("/admin/jugadores");
  }

  return <LoginForm onSuccess={handleSuccess} />;
}

export default AdminLoginPage;
