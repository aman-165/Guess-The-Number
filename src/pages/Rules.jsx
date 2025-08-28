import { useNavigate } from "react-router-dom";

export default function Rules() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">Game Rules</h1>
      <div className="rules-container">
        <ol>
          <li>Guess the correct 5‑digit number.</li>
          <li>You have <strong>5 lives</strong> (one per attempt).</li>
          <li>
            After each guess, each digit gets feedback:
            <ul>
              <li><span className="pill green">Green</span> = correct digit & correct position</li>
              <li><span className="pill yellow">Yellow</span> = correct digit, wrong position</li>
              <li><span className="pill grey">Grey</span> = digit not in the number</li>
            </ul>
          </li>
          <li>Win by guessing the code before you run out of lives.</li>
          <li>No leading zero restrictions — any digits 0‑9 allowed.</li>
        </ol>

        <div className="menu row">
          <button onClick={() => navigate("/")} className="btn"><span>Back</span></button>
          <button onClick={() => navigate("/game")} className="btn btn-primary"><span>Play</span></button>
        </div>
      </div>
    </div>
  );
}
