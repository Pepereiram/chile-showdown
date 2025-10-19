
import ButtonNav from "./ButtonNav";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "../routes";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-center bg-gray-100 py-3 shadow-md">
      {appRoutes.map((route) => (
        <ButtonNav
          key={route.path}
          name={route.name}
          onClick={() => navigate(route.path)}
        />
      ))}
    </nav>
  );
}

export default Navbar;
