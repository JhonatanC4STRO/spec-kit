import { JSX } from "react";
import { Link } from "react-router-dom";

function NavPublica(): JSX.Element {
  return (
    <Link to="/admin/login" className="text-primary underline">
      Login admin
    </Link>
  );
}

export default NavPublica;
