import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";
import "../styles/rules.css";

const feedback = [
  {
    color: "green",
    name: "GREEN",
    meaning: "Correct digit",
    detail: "The digit is in the secret code and in the correct position.",
    sample: "7",
  },
  {
    color: "yellow",
    name: "YELLOW",
    meaning: "Wrong position",
    detail: "The digit is in the secret code, but it belongs in another position.",
    sample: "2",
  },
  {
    color: "grey",
    name: "GREY",
    meaning: "Not in the code",
    detail: "The digit does not appear in the secret code.",
    sample: "9",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter your code",
    description: "Type any five-digit combination using digits from 0 to 9.",
    icon: "⌨",
  },
  {
    number: "02",
    title: "Read the clues",
    description: "Check the color of each tile to learn which digits are correct.",
    icon: "◈",
  },
  {
    number: "03",
    title: "Crack the number",
    description: "Use the clues from each guess to find the secret code within five attempts.",
    icon: "✦",
  },
];

export default function Rules() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="How to Play | Guess The Number Game Rules"
        description="Learn how to play Guess The Number. Understand green, yellow and grey clues and discover how to crack the secret 5-digit code."
        canonicalPath="/rules"
      />
      <div className="rules-page">
        <section className="rules-hero" aria-labelledby="rules-title">
          <div className="rules-hero__copy">
            <span className="rules-eyebrow"><i /> GAME GUIDE</span>
            <h1 id="rules-title">
              Know the clues.<br />
              <span>Crack the code.</span>
            </h1>
            <p>
              A little logic goes a long way. Learn the rules, understand the
              colors, and get ready to find the hidden five-digit number.
            </p>
            <div className="rules-hero__actions">
              <button
                type="button"
                className="rules-primary-button"
                onClick={() => navigate("/game")}
              >
                <span aria-hidden="true">▶</span> Play the game <span aria-hidden="true">↗</span>
              </button>
              <button
                type="button"
                className="rules-secondary-button"
                onClick={() => navigate("/")}
              >
                Back to home
              </button>
            </div>
          </div>

          <div className="rules-stats" aria-label="Game limits">
            <div className="rules-stat">
              <strong>05</strong>
              <span>DIGITS TO GUESS</span>
            </div>
            <div className="rules-stat">
              <strong>05</strong>
              <span>ATTEMPTS</span>
            </div>
            <div className="rules-stat">
              <strong>0–9</strong>
              <span>AVAILABLE DIGITS</span>
            </div>
          </div>
        </section>

        <section className="rules-section" aria-labelledby="rules-steps-title">
          <div className="rules-section-heading">
            <div>
              <span className="rules-kicker">HOW IT WORKS</span>
              <h2 id="rules-steps-title">Three steps to victory.</h2>
            </div>
            <span className="rules-heading-note">SIMPLE TO LEARN <b>✦</b></span>
          </div>

          <div className="rules-steps-grid">
            {steps.map((step) => (
              <article className="rules-step-card" key={step.number}>
                <div className="rules-step-card__top">
                  <span className="rules-step-icon" aria-hidden="true">{step.icon}</span>
                  <span className="rules-step-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rules-feedback-section" aria-labelledby="rules-feedback-title">
          <div className="rules-section-heading">
            <div>
              <span className="rules-kicker">THE COLOR SYSTEM</span>
              <h2 id="rules-feedback-title">Every color tells a story.</h2>
            </div>
            <span className="rules-heading-note">READ THE FEEDBACK <b>✦</b></span>
          </div>

          <div className="rules-feedback-grid">
            {feedback.map((item) => (
              <article className={`rules-feedback-card rules-feedback-card--${item.color}`} key={item.color}>
                <div className="rules-feedback-card__top">
                  <span className={`rules-feedback-tile rules-feedback-tile--${item.color}`}>
                    {item.sample}
                  </span>
                  <span className={`rules-feedback-label rules-feedback-label--${item.color}`}>
                    {item.name}
                  </span>
                </div>
                <h3>{item.meaning}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rules-reminder" aria-label="Important game rules">
          <div className="rules-reminder__icon" aria-hidden="true">!</div>
          <div className="rules-reminder__copy">
            <span className="rules-kicker">KEEP IN MIND</span>
            <h2>Five attempts. No leading-zero restriction.</h2>
            <p>
              You have five attempts to guess the secret code. A guess may start
              with zero, and every digit from 0 to 9 is allowed.
            </p>
          </div>
        </section>

        <section className="rules-final-cta">
          <div>
            <span className="rules-kicker">READY TO TEST YOUR LOGIC?</span>
            <h2>Your five attempts start now.</h2>
          </div>
          <button type="button" className="rules-primary-button" onClick={() => navigate("/game")}>
            Start guessing <span aria-hidden="true">↗</span>
          </button>
        </section>
      </div>
    </>
  );
}
