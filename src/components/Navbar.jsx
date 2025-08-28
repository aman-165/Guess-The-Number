import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="brand">Number Guesser</div>
      <nav>
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/game" className="nav-link">Play</NavLink>
        <NavLink to="/rules" className="nav-link">Rules</NavLink>
      </nav>
    </header>
  );
}
