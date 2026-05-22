import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./styles/AppNavbar.css";

const NAV_LINKS = [
  { to: "/personas", label: "Personas" },
  { to: "/mascotas", label: "Mascotas" },
  { to: "/censo", label: "Censos" },
  { to: "/mapa", label: "Mapa" },
];

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-link nav-link--active" : "nav-link"
      }
    >
      {label}
    </NavLink>
  );
}

function AppNavbar() {
  const { logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-brand-name">CAT CENSUS</span>
      </div>
      <nav className="navbar-links" aria-label="Navegación principal">
        {NAV_LINKS.map(({ to, label }) => (
          <NavItem key={to} to={to} label={label} />
        ))}
      </nav>
      <button className="navbar-logout" type="button" onClick={logout}>
        Salir
      </button>
    </header>
  );
}

export default AppNavbar;
