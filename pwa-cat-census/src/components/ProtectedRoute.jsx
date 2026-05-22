import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AppNavbar from "./AppNavbar";
import "./styles/ProtectedRoute.css";

function ProtectedRoute() {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="protected-layout">
      <AppNavbar />
      <main className="protected-content">
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedRoute;
