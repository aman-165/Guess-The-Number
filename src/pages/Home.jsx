import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const best = localStorage.getItem("bestScore");

  return (
    <div className="container">
      <h1 className="title">Number Guesser</h1>
      <p className="subtitle">Guess the secret 5‑digit code in 5 tries.</p>

      <div className="menu">
        <button onClick={() => navigate("/game")} className="btn btn-primary">
          <span>Play Game</span>
        </button>
        <button onClick={() => navigate("/rules")} className="btn btn-warn">
          <span>How to Play</span>
        </button>
      </div>

      <div className="stats-card">
        <div>Best Score</div>
        <strong>{best ? `${best} attempt${best === "1" ? "" : "s"}` : "—"}</strong>
      </div>
    </div>
  );
}
