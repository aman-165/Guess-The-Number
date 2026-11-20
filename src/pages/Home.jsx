import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const feedbackTiles = [
  { digit: "7", status: "is-correct", label: "Correct position" },
  { digit: "2", status: "is-misplaced", label: "Correct digit, wrong position" },
  { digit: "9", status: "is-absent", label: "Not in the code" },
  { digit: "4", status: "is-correct", label: "Correct position" },
  { digit: "1", status: "is-absent", label: "Not in the code" },
];

function TilePreview() {
  return (
    <div className="home-code-preview" aria-label="Example of the game's digit feedback">
      <div className="home-code-preview__top">
        <span>THE CODE IS WAITING</span>
        <span className="home-code-preview__live"><i /> READY</span>
      </div>
      <div className="home-code-preview__tiles">
        {feedbackTiles.map((tile, index) => (
          <span
            key={`${tile.digit}-${index}`}
            className={`home-code-tile ${tile.status}`}
            aria-label={`${tile.digit}: ${tile.label}`}
          >
            {tile.digit}
          </span>
        ))}
      </div>
      <div className="home-code-preview__legend">
        <span><i className="legend-correct" /> Right place</span>
        <span><i className="legend-misplaced" /> Wrong place</span>
        <span><i className="legend-absent" /> Not included</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, onClick, action }) {
  return (
    <button className="home-feature-card" type="button" onClick={onClick}>
      <span className="home-feature-card__icon" aria-hidden="true">{icon}</span>
      <span className="home-feature-card__body">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="home-feature-card__action" aria-hidden="true">{action || "→"}</span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const best = localStorage.getItem("bestScore");
  const hasBestScore = best !== null && best !== "" && Number.isFinite(Number(best));

  return (
    <>
      <SEO
        title="Free Online Number Guessing Game | Guess The Number"
        description="Play a free 5-digit number guessing game. Use logic and color clues to crack the secret code in just five attempts."
        canonicalPath="/"
      />
      <div className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
            <span className="home-eyebrow"><i /> THE NUMBER GUESSING GAME</span>
            <h1 id="home-title">
              Think sharp.<br />
              <span>Crack the code.</span>
            </h1>
            <p className="home-hero__description">
              Five digits. Five attempts. One chance to prove your instincts.
              Can you find the hidden number?
            </p>

            <div className="home-hero__actions">
              <button
                type="button"
                className="home-primary-cta"
                onClick={() => navigate("/game")}
              >
                <span className="home-cta-play" aria-hidden="true">▶</span>
                <span>Start playing</span>
                <span className="home-cta-arrow" aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                className="home-secondary-cta"
                onClick={() => navigate("/rules")}
              >
                How to play <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="home-quick-facts" aria-label="Game rules">
              <span><b>05</b> digits</span>
              <i />
              <span><b>05</b> attempts</span>
              <i />
              <span><b>10</b> possible digits</span>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="home-visual-orbit home-visual-orbit--outer" />
            <div className="home-visual-orbit home-visual-orbit--inner" />
            <div className="home-visual-glow" />
            <TilePreview />
            <div className="home-floating-chip home-floating-chip--top">
              <span>✦</span> LOGIC MEETS LUCK
            </div>
            <div className="home-floating-chip home-floating-chip--bottom">
              <span className="home-chip-dot" /> YOUR NEXT WIN STARTS HERE
            </div>
          </div>
        </section>

        <section className="home-dashboard-strip" aria-label="Your game snapshot">
          <div className="home-best-score">
            <span className="home-strip-icon" aria-hidden="true">♛</span>
            <span className="home-strip-copy">
              <small>PERSONAL BEST</small>
              <strong>{hasBestScore ? `${best} ${best === "1" ? "attempt" : "attempts"}` : "No score yet"}</strong>
            </span>
          </div>
          <div className="home-strip-divider" />
          <div className="home-strip-note">
            <span className="home-strip-icon home-strip-icon--cyan" aria-hidden="true">✧</span>
            <span className="home-strip-copy">
              <small>YOUR NEXT CHALLENGE</small>
              <strong>Ready when you are</strong>
            </span>
          </div>
          <button className="home-strip-link" type="button" onClick={() => navigate("/game")}>
            Play now <span aria-hidden="true">↗</span>
          </button>
        </section>

        <section className="home-mode-section" aria-labelledby="home-mode-title">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">CHOOSE YOUR MODE</span>
              <h2 id="home-mode-title">Make your next move.</h2>
            </div>
            <span className="home-section-aside">PICK A CHALLENGE <b>✦</b></span>
          </div>

          <div className="home-feature-grid">
            <FeatureCard
              icon="⚡"
              title="Quick Play"
              description="Jump into a solo game and crack a random 5-digit code."
              action="PLAY"
              onClick={() => navigate("/game")}
            />
            <FeatureCard
              icon="✦"
              title="Daily Challenge"
              description="Take on today's shared challenge. One new code every day."
              action="DAILY"
              onClick={() => navigate("/daily-challenge")}
            />
            <FeatureCard
              icon="⌘"
              title="Game Rules"
              description="Learn the color clues and sharpen your guessing strategy."
              action="LEARN"
              onClick={() => navigate("/rules")}
            />
          </div>
        </section>

        <section className="home-bottom-note">
          <span className="home-bottom-note__spark" aria-hidden="true">✧</span>
          <p><strong>Every guess gives you a clue.</strong> Use the feedback, trust your logic, and beat the code.</p>
          <span className="home-bottom-note__tag">LET'S PLAY</span>
        </section>
      </div>
    </>
  );
}
