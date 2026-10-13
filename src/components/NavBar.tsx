import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function NavBar() {
  const { user, account, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="brand">Taskly</span>
      <NavLink to="/">Dashboard</NavLink>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/settings">Settings</NavLink>
      <span className="spacer" />
      <span className="account-name">{account?.name}</span>
      <span className="user-email">{user?.email}</span>
      <button id="logout-button" type="button" onClick={logout}>
        Log out
      </button>
    </nav>
  );
}
