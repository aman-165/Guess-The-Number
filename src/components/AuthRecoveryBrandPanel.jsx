export default function AuthRecoveryBrandPanel({ mode = "recovery" }) {
  const isReset = mode === "reset";

  return (
    <aside className="auth-showcase auth-recovery-showcase" aria-label="Number Guesser account security">
      <div className="auth-showcase__glow auth-showcase__glow--one" />
      <div className="auth-showcase__glow auth-showcase__glow--two" />
      <div className="auth-showcase__eyebrow"><span /> PLAYER ACCOUNT SECURITY</div>
      <div className="auth-showcase__title">
        {isReset ? <>A FRESH<br /><span>START.</span></> : <>GET BACK<br /><span>IN THE GAME.</span></>}
      </div>
      <p className="auth-showcase__copy">
        {isReset
          ? "Choose a strong new password and get ready for your next winning streak."
          : "A forgotten password shouldn't stop your next big win. Recover access securely in just a few steps."}
      </p>
      <div className="auth-recovery-visual" aria-hidden="true">
        <div className="auth-recovery-visual__icon">{isReset ? "✦" : "↗"}</div>
        <div>
          <b>{isReset ? "NEW PASSWORD" : "ACCOUNT RECOVERY"}</b>
          <span>{isReset ? "Secure your player account" : "A private link, sent to your inbox"}</span>
        </div>
        <i>●</i>
      </div>
      <div className="auth-showcase__footer"><span>SECURE ACCESS</span><b>·</b><span>PLAYER FIRST</span></div>
    </aside>
  );
}
