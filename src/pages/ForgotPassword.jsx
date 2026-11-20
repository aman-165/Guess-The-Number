import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import AuthRecoveryBrandPanel from "../components/AuthRecoveryBrandPanel";

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Enter the email address linked to your account.");
      return;
    }

    setError("");
    setSent(false);
    setLoading(true);

    try {
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (requestError) throw requestError;
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || "We couldn't send the recovery email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-recovery-page">
      <AuthRecoveryBrandPanel />
      <div className="auth-form-side">
        <div className="auth-card auth-recovery-card">
          <div className="auth-mobile-mark"><span>NG</span> NUMBER GUESSER</div>
          <div className="auth-recovery-symbol"><MailIcon /></div>
          <div className="auth-card__heading">
            <span className="auth-kicker">ACCOUNT RECOVERY</span>
            <h1>Forgot your <span>password?</span></h1>
            <p>Enter your registered email and we'll send you a secure recovery link.</p>
          </div>

          {sent ? (
            <div className="auth-recovery-success" role="status" aria-live="polite">
              <span className="auth-recovery-success__check">✓</span>
              <div>
                <b>Check your inbox</b>
                <p>If an account exists for <strong>{email.trim()}</strong>, a password recovery link will arrive shortly. Check your spam folder too.</p>
              </div>
              <button type="button" className="auth-recovery-text-button" onClick={() => setSent(false)}>Try another email</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email address</span>
                <input
                  type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }}
                  placeholder="you@example.com" autoComplete="email" autoCapitalize="none" inputMode="email" required
                />
              </label>
              <button className="auth-submit" type="submit" disabled={loading}>
                <span>{loading ? "Sending recovery link..." : "Send recovery link"}</span>
                <span aria-hidden="true">↗</span>
              </button>
              <p className="auth-recovery-privacy">For your security, we won't reveal whether an email is registered.</p>
            </form>
          )}

          {error && <p className="auth-feedback auth-feedback--error" role="alert">{error}</p>}
          <div className="auth-switch auth-recovery-back">Remembered your password? <Link to="/login">Back to sign in <span>→</span></Link></div>
          <div className="auth-card__bottom"><span>●</span> YOUR PROGRESS. YOUR NEXT LEVEL.</div>
        </div>
      </div>
    </section>
  );
}
